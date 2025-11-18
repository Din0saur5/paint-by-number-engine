"""Full paint-by-numbers pipeline orchestration."""

from __future__ import annotations

from typing import BinaryIO

import numpy as np
from PIL import Image

from app.services.image_pipeline.io import load_and_resize
from app.services.image_pipeline.numbering import add_numbers
from app.services.image_pipeline.outline import make_outline_image
from app.services.image_pipeline.palette import render_painted_preview
from app.services.image_pipeline.quantize import quantize_colors
from app.services.image_pipeline.regions import merge_small_regions


def render_paint_by_numbers(
    image_file: BinaryIO,
    *,
    num_colors: int,
    max_width: int,
    min_region_size: int = 0,
) -> tuple[Image.Image, Image.Image, np.ndarray, np.ndarray]:
    """Run the complete pipeline and return the final image plus metadata."""

    resized = load_and_resize(image_file, max_width=max_width)
    label_img, palette = quantize_colors(resized, num_colors=num_colors)
    if min_region_size > 0:
        label_img = merge_small_regions(label_img, min_region_size)
    outline_img = make_outline_image(label_img)
    numbered_img = add_numbers(outline_img, label_img, palette, min_region_size)
    preview_img = render_painted_preview(label_img, palette)
    return numbered_img, preview_img, palette, label_img
