"""Palette metadata helpers and legend rendering."""

from __future__ import annotations

from io import BytesIO
from typing import Sequence

import numpy as np
from PIL import Image, ImageDraw

from app.services.image_pipeline.fonts import load_font


def rgb_to_hex(color: Sequence[int]) -> str:
    r, g, b = (int(c) for c in color)
    return f"#{r:02X}{g:02X}{b:02X}"


def build_palette_metadata(palette: np.ndarray) -> list[dict[str, object]]:
    metadata: list[dict[str, object]] = []
    for idx, color in enumerate(palette, start=1):
        rgb = tuple(int(c) for c in color.tolist())
        metadata.append(
            {
                "number": idx,
                "rgb": rgb,
                "hex": rgb_to_hex(rgb),
            }
        )
    return metadata


def render_palette_pdf(
    metadata: list[dict[str, object]], width: int = 2550, height: int = 3300
) -> bytes:
    """Create a simple legend PDF listing colors, numbers, and hex codes."""

    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)

    header_font = load_font(120)
    body_font = load_font(72)

    draw.text(
        (width // 2, 200),
        "Paint-By-Number Palette",
        fill="black",
        font=header_font,
        anchor="mm",
    )

    top_margin = 360
    row_height = max(180, (height - top_margin - 180) // max(1, len(metadata)))
    swatch_size = 150
    left_margin = 200

    for idx, entry in enumerate(metadata):
        y = top_margin + idx * row_height
        swatch_box = (
            left_margin,
            y,
            left_margin + swatch_size,
            y + swatch_size,
        )
        draw.rectangle(swatch_box, fill=tuple(entry["rgb"]), outline="black")

        text = f"#{entry['number']}  RGB {entry['rgb']}  HEX {entry['hex']}"
        draw.text(
            (left_margin + swatch_size + 40, y + swatch_size / 2),
            text,
            fill="black",
            font=body_font,
            anchor="lm",
        )

    buffer = BytesIO()
    image.save(buffer, format="PDF")
    return buffer.getvalue()


def render_painted_preview(label_img, palette: np.ndarray) -> Image.Image:
    labels = np.asarray(label_img)
    height, width = labels.shape
    preview = Image.new("RGB", (width, height), "white")
    pixels = preview.load()

    for y in range(height):
        for x in range(width):
            color = tuple(int(c) for c in palette[labels[y, x]])
            pixels[x, y] = color

    return preview
