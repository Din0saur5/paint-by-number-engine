"""Outline generation utilities."""

from __future__ import annotations

import numpy as np
from PIL import Image


def make_outline_image(label_img) -> Image.Image:
    """Return a monochrome outline image from a 2D label array."""

    labels = np.asarray(label_img)
    if labels.ndim != 2:
        raise ValueError("label_img must be a 2D array")

    borders = np.zeros_like(labels, dtype=bool)

    diff_down = labels[:-1, :] != labels[1:, :]
    borders[:-1, :] |= diff_down
    borders[1:, :] |= diff_down

    diff_right = labels[:, :-1] != labels[:, 1:]
    borders[:, :-1] |= diff_right
    borders[:, 1:] |= diff_right

    outline = np.full(labels.shape, 255, dtype=np.uint8)
    outline[borders] = 0

    return Image.fromarray(outline, mode="L")
