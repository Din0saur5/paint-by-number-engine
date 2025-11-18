"""Image loading and resizing utilities (stub)."""

from typing import BinaryIO

from PIL import Image


def load_and_resize(image_file: BinaryIO, max_width: int) -> Image.Image:
    """Placeholder implementation; real logic will resize proportionally."""
    with Image.open(image_file) as img:
        return img.convert("RGB")
