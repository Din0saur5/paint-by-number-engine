import base64
import io

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app


client = TestClient(app)


def _make_upload():
    image = Image.new("RGB", (4, 4))
    pixels = []
    colors = [(255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 0)]
    for y in range(4):
        for x in range(4):
            pixels.append(colors[(x + y) % len(colors)])
    image.putdata(pixels)
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer


def test_generate_endpoint_returns_assets():
    buffer = _make_upload()
    files = {"file": ("test.png", buffer, "image/png")}
    data = {"num_colors": "3", "max_width": "800"}

    response = client.post("/generate/", data=data, files=files)

    assert response.status_code == 200
    payload = response.json()
    assert payload["image"]["content_type"] == "image/png"
    png_data = base64.b64decode(payload["image"]["data"])
    assert png_data.startswith(b"\x89PNG")
    assert payload["preview"]["content_type"] == "image/png"
    preview_data = base64.b64decode(payload["preview"]["data"])
    assert preview_data.startswith(b"\x89PNG")
    assert payload["legend"]["content_type"] == "application/pdf"
    pdf_data = base64.b64decode(payload["legend"]["data"])
    assert pdf_data.startswith(b"%PDF")
    assert len(payload["palette"]) == 3


def test_generate_endpoint_rejects_bad_mime():
    response = client.post(
        "/generate/",
        data={"num_colors": "3", "max_width": "100"},
        files={"file": ("test.txt", b"abc", "text/plain")},
    )

    assert response.status_code == 400
    assert "Unsupported file type" in response.text


def test_generate_endpoint_rejects_invalid_ranges():
    buffer = _make_upload()
    files = {"file": ("test.png", buffer, "image/png")}

    response = client.post(
        "/generate/",
        data={"num_colors": "1", "max_width": "100"},
        files=files,
    )
    assert response.status_code == 400

    buffer = _make_upload()
    response = client.post(
        "/generate/",
        data={"num_colors": "5", "max_width": "10000"},
        files={"file": ("test.png", buffer, "image/png")},
    )
    assert response.status_code == 400
