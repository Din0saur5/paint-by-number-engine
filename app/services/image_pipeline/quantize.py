"""Color quantization utilities."""

from __future__ import annotations

import numpy as np
from PIL import Image
from sklearn.cluster import KMeans


def quantize_colors(image: Image.Image, num_colors: int) -> tuple[np.ndarray, np.ndarray]:
    """Reduce the palette of ``image`` to ``num_colors`` clusters via k-means."""

    if num_colors <= 0:
        raise ValueError("num_colors must be a positive integer")

    rgb_image = image.convert("RGB")
    np_image = np.asarray(rgb_image, dtype=np.uint8)
    height, width, _ = np_image.shape

    flat_pixels = np_image.reshape(-1, 3)

    kmeans = KMeans(
        n_clusters=num_colors,
        random_state=0,
        n_init="auto",
    )
    kmeans.fit(flat_pixels)

    labels = kmeans.labels_.reshape(height, width)
    palette = np.clip(np.rint(kmeans.cluster_centers_), 0, 255).astype(np.uint8)

    return labels, palette
