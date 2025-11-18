import numpy as np

from app.services.image_pipeline.palette import build_palette_metadata, render_palette_pdf


def test_build_palette_metadata_generates_hex():
    palette = np.array([[255, 0, 0], [0, 128, 64]], dtype=np.uint8)

    metadata = build_palette_metadata(palette)

    assert metadata == [
        {"number": 1, "rgb": (255, 0, 0), "hex": "#FF0000"},
        {"number": 2, "rgb": (0, 128, 64), "hex": "#008040"},
    ]


def test_render_palette_pdf_returns_pdf_bytes():
    metadata = [
        {"number": 1, "rgb": (255, 0, 0), "hex": "#FF0000"},
        {"number": 2, "rgb": (0, 128, 64), "hex": "#008040"},
    ]

    pdf_bytes = render_palette_pdf(metadata)

    assert pdf_bytes.startswith(b"%PDF")
    # sanity check: not empty
    assert len(pdf_bytes) > 1000
