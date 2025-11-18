import numpy as np
from PIL import Image

from app.services.image_pipeline.numbering import add_numbers


def test_add_numbers_draws_text_for_each_cluster():
    outline = Image.new("RGB", (6, 6), color="white")
    labels = np.array(
        [
            [0, 0, 0, 1, 1, 1],
            [0, 0, 0, 1, 1, 1],
            [0, 0, 0, 1, 1, 1],
            [2, 2, 2, 1, 1, 1],
            [2, 2, 2, 3, 3, 3],
            [2, 2, 2, 3, 3, 3],
        ]
    )
    palette = np.array([[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0]], dtype=np.uint8)

    result = add_numbers(outline, labels, palette)
    pixels = np.array(result)

    assert result.mode == "RGB"
    assert not np.all(pixels == 255)


def test_add_numbers_handles_empty_clusters():
    outline = Image.new("RGB", (3, 3), color="white")
    labels = np.zeros((3, 3), dtype=int)
    palette = np.array([[255, 0, 0], [0, 0, 255]], dtype=np.uint8)

    result = add_numbers(outline, labels, palette)

    assert isinstance(result, Image.Image)
