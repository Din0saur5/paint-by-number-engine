"""Numbering utilities."""

from __future__ import annotations

import numpy as np
from PIL import Image, ImageDraw

from app.services.image_pipeline.fonts import load_font
from app.services.image_pipeline.regions import find_regions, region_label_position


def add_numbers(
    outline_img: Image.Image, label_img, palette, min_region_size: int = 0
) -> Image.Image:
    """Draw numbers inside each region, not just per color cluster."""

    labels = np.asarray(label_img)
    if labels.ndim != 2:
        raise ValueError("label_img must be a 2D array")

    result = outline_img.convert("RGB")
    draw = ImageDraw.Draw(result)
    font_size = max(24, result.width // 50)
    font = load_font(font_size)

    def draw_label(x: int, y: int, text: str) -> None:
        offsets = [(-1, -1), (-1, 1), (1, -1), (1, 1)]
        for dx, dy in offsets:
            draw.text((x + dx, y + dy), text, fill="white", font=font, anchor="mm")
        draw.text((x, y), text, fill="black", font=font, anchor="mm")

    regions = find_regions(labels)
    region_counts: dict[int, int] = {}

    for region in regions:
        if min_region_size and region.size() < min_region_size:
            continue
        region_counts.setdefault(region.label, 0)
        region_counts[region.label] += 1
        text = str(region.label + 1)

        y, x = region_label_position(labels, region)
        draw_label(x, y, text)

    return result
