import numpy as np

from app.services.image_pipeline.outline import make_outline_image


def test_uniform_labels_produce_white_image():
    labels = np.zeros((3, 3), dtype=int)

    image = make_outline_image(labels)
    result = np.array(image)

    assert image.mode == "L"
    assert np.all(result == 255)


def test_outline_detects_simple_boundary():
    labels = np.array(
        [
            [0, 0, 0],
            [0, 1, 1],
            [0, 1, 1],
        ],
        dtype=int,
    )

    image = make_outline_image(labels)
    result = np.array(image)

    expected = np.array(
        [
            [255, 0, 0],
            [0, 0, 0],
            [0, 0, 255],
        ],
        dtype=np.uint8,
    )

    assert np.array_equal(result, expected)
