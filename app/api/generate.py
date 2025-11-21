from __future__ import annotations

import base64
from io import BytesIO
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from PIL import Image

from app.core.config import settings
from app.services.image_pipeline.pipeline import render_paint_by_numbers
from app.services.image_pipeline.palette import build_palette_metadata, render_palette_pdf


router = APIRouter(prefix="/generate", tags=["generate"])

ALLOWED_CONTENT_TYPES = {"image/png", "image/jpeg", "image/jpg"}


def _sanitize_filename(filename: str | None) -> str:
    stem = Path(filename or "output").stem
    if not stem:
        stem = "output"
    return f"{stem}_paint_by_numbers.png"


MAX_FILE_BYTES = settings.max_upload_bytes
MIN_COLORS = settings.min_colors
MAX_COLORS = settings.max_colors
MIN_WIDTH = settings.min_width
MAX_WIDTH = settings.max_width
MIN_REGION_SIZE = 50
MAX_REGION_SIZE = 5000


@router.post("/", summary="Generate a paint-by-numbers PNG with palette legend")
async def generate_image(
    file: UploadFile = File(...),
    num_colors: int = Form(settings.default_num_colors),
    max_width: int = Form(settings.default_max_width),
    min_region_size: int = Form(settings.min_region_size),
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type")
    if num_colors < MIN_COLORS or num_colors > MAX_COLORS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"num_colors must be between {MIN_COLORS} and {MAX_COLORS}",
        )
    if max_width < MIN_WIDTH or max_width > MAX_WIDTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"max_width must be between {MIN_WIDTH} and {MAX_WIDTH}",
        )
    if min_region_size < MIN_REGION_SIZE or min_region_size > MAX_REGION_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"min_region_size must be between {MIN_REGION_SIZE} and {MAX_REGION_SIZE}",
        )

    contents = await file.read(MAX_FILE_BYTES + 1)
    if len(contents) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File is empty")
    if len(contents) > MAX_FILE_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large")

    # Normalize incoming images (JPEG/PNG) to PNG to handle edge cases consistently
    try:
        input_image = Image.open(BytesIO(contents))
    except Exception as exc:  # pragma: no cover - PIL raises many subclasses
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image file") from exc

    if input_image.mode not in ("RGB", "RGBA"):
        input_image = input_image.convert("RGB")

    normalized_buffer = BytesIO()
    input_image.save(normalized_buffer, format="PNG")
    normalized_buffer.seek(0)

    final_image, preview_image, palette, _ = render_paint_by_numbers(
        normalized_buffer,
        num_colors=num_colors,
        max_width=max_width,
        min_region_size=min_region_size,
    )
    palette_metadata = build_palette_metadata(palette)

    png_buffer = BytesIO()
    final_image.save(png_buffer, format="PNG")
    png_b64 = base64.b64encode(png_buffer.getvalue()).decode("ascii")

    legend_pdf_bytes = render_palette_pdf(palette_metadata)
    legend_b64 = base64.b64encode(legend_pdf_bytes).decode("ascii")

    preview_buffer = BytesIO()
    preview_image.save(preview_buffer, format="PNG")
    preview_b64 = base64.b64encode(preview_buffer.getvalue()).decode("ascii")

    return {
        "image": {
            "filename": _sanitize_filename(file.filename),
            "content_type": "image/png",
            "width": final_image.width,
            "height": final_image.height,
            "data": png_b64,
        },
        "preview": {
            "filename": f"{Path(file.filename or 'output').stem}_painted_preview.png",
            "content_type": "image/png",
            "width": preview_image.width,
            "height": preview_image.height,
            "data": preview_b64,
        },
        "palette": palette_metadata,
        "legend": {
            "filename": f"{Path(file.filename or 'output').stem}_palette_legend.pdf",
            "content_type": "application/pdf",
            "data": legend_b64,
        },
    }
