"""Font loading helpers for consistent text rendering."""

from functools import lru_cache

from PIL import ImageFont


@lru_cache(maxsize=8)
def load_font(size: int) -> ImageFont.ImageFont:
    """Return a TrueType font at the requested size, fallback to PIL default."""

    candidates = [
        "DejaVuSans-Bold.ttf",
        "DejaVuSans.ttf",
        "Arial.ttf",
        "Helvetica.ttf",
    ]
    for name in candidates:
        try:
            return ImageFont.truetype(name, size=size)
        except OSError:
            continue
    return ImageFont.load_default()
