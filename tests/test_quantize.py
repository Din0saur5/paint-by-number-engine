import numpy as np
from PIL import Image

from app.services.image_pipeline.quantize import quantize_colors


def make_test_image() -> Image.Image:
    img = Image.new("RGB", (2, 2))
    img.putdata(
        [
            (255, 0, 0),
            (255, 0, 0),
            (0, 255, 0),
            (0, 0, 255),
        ]
    )
    return img


def test_quantize_colors_returns_expected_shapes():
    img = make_test_image()

    labels, palette = quantize_colors(img, num_colors=3)

    assert labels.shape == (2, 2)
    assert palette.shape == (3, 3)
    assert palette.dtype == np.uint8
    assert labels.dtype.kind == "i"


def test_quantize_colors_raises_for_invalid_k():
    img = make_test_image()

    try:
        quantize_colors(img, num_colors=0)
    except ValueError as exc:
        assert "num_colors" in str(exc)
    else:
        assert False, "Expected ValueError"
