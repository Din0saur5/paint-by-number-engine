"""Generate sample paint-by-number output using test-image.png."""

from __future__ import annotations

import json
from pathlib import Path

from app.core.config import settings
from app.services.image_pipeline.palette import (
    build_palette_metadata,
    render_palette_pdf,
)
from app.services.image_pipeline.pipeline import render_paint_by_numbers


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    input_path = root / "test-image.png"
    output_dir = root / "test-products"
    output_dir.mkdir(exist_ok=True)

    if not input_path.exists():
        raise FileNotFoundError(f"Missing {input_path}")

    with input_path.open("rb") as infile:
        line_image, preview_image, palette, _ = render_paint_by_numbers(
            infile,
            num_colors=settings.default_num_colors,
            max_width=settings.default_max_width,
            min_region_size=settings.min_region_size,
        )

    png_path = output_dir / "test-image-paint-by-number.png"
    line_image.save(png_path, format="PNG")

    preview_path = output_dir / "test-image-painted-preview.png"
    preview_image.save(preview_path, format="PNG")

    metadata = build_palette_metadata(palette)
    legend_pdf = render_palette_pdf(metadata)
    legend_path = output_dir / "test-image-palette-legend.pdf"
    legend_path.write_bytes(legend_pdf)

    palette_json_path = output_dir / "test-image-palette.json"
    palette_json_path.write_text(json.dumps(metadata, indent=2))

    print(f"Wrote {png_path}")
    print(f"Wrote {preview_path}")
    print(f"Wrote {legend_path}")
    print(f"Wrote {palette_json_path}")


if __name__ == "__main__":
    main()
