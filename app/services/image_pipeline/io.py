"""Image loading and resizing utilities."""

from __future__ import annotations

from typing import BinaryIO

from PIL import Image


def load_and_resize(image_file: BinaryIO, max_width: int) -> Image.Image:
    """Load an image, convert to RGB, and scale it down to ``max_width`` if needed."""

    if max_width <= 0:
        raise ValueError("max_width must be a positive integer")

    if hasattr(image_file, "seek"):
        image_file.seek(0)

    with Image.open(image_file) as img:
        rgb_img = img.convert("RGB")

    width, height = rgb_img.size
    if width <= max_width:
        return rgb_img

    scale = max_width / float(width)
    new_height = max(1, int(round(height * scale)))
    return rgb_img.resize((max_width, new_height), Image.LANCZOS)
