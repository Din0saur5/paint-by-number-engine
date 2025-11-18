import io

from PIL import Image

from app.services.image_pipeline.io import load_and_resize


def _make_image(width: int, height: int, color: tuple[int, int, int] = (255, 0, 0)) -> io.BytesIO:
    image = Image.new("RGB", (width, height), color=color)
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer


def test_wide_image_is_resized_down_to_max_width():
    source = _make_image(2000, 1000)

    result = load_and_resize(source, max_width=1000)

    assert result.size == (1000, 500)
    assert result.mode == "RGB"


def test_smaller_image_remains_unchanged():
    original_width, original_height = 800, 600
    source = _make_image(original_width, original_height)

    result = load_and_resize(source, max_width=1200)

    assert result.size == (original_width, original_height)
