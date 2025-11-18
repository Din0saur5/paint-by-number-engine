"""Region utilities for smoothing label maps."""

from __future__ import annotations

from collections import Counter, deque
from dataclasses import dataclass

import numpy as np


NEIGHBORS: tuple[tuple[int, int], ...] = ((1, 0), (-1, 0), (0, 1), (0, -1))


@dataclass
class Region:
    label: int
    pixels: list[tuple[int, int]]

    def size(self) -> int:
        return len(self.pixels)


def find_regions(label_img) -> list[Region]:
    labels = np.asarray(label_img)
    height, width = labels.shape
    visited = np.zeros_like(labels, dtype=bool)
    regions: list[Region] = []

    for y in range(height):
        for x in range(width):
            if visited[y, x]:
                continue
            label = labels[y, x]
            queue = deque([(y, x)])
            visited[y, x] = True
            pixels: list[tuple[int, int]] = []

            while queue:
                cy, cx = queue.popleft()
                pixels.append((cy, cx))
                for dy, dx in NEIGHBORS:
                    ny, nx = cy + dy, cx + dx
                    if (
                        0 <= ny < height
                        and 0 <= nx < width
                        and not visited[ny, nx]
                        and labels[ny, nx] == label
                    ):
                        visited[ny, nx] = True
                        queue.append((ny, nx))

            regions.append(Region(label=label, pixels=pixels))

    return regions


def merge_small_regions(label_img, min_size: int) -> np.ndarray:
    """Merge connected components smaller than ``min_size`` into neighboring regions."""

    if min_size <= 0:
        return np.asarray(label_img)

    labels = np.asarray(label_img).copy()
    height, width = labels.shape
    visited = np.zeros_like(labels, dtype=bool)

    for y in range(height):
        for x in range(width):
            if visited[y, x]:
                continue
            target_label = labels[y, x]
            component = []
            queue = deque([(y, x)])
            visited[y, x] = True

            while queue:
                cy, cx = queue.popleft()
                component.append((cy, cx))
                for dy, dx in NEIGHBORS:
                    ny, nx = cy + dy, cx + dx
                    if (
                        0 <= ny < height
                        and 0 <= nx < width
                        and not visited[ny, nx]
                        and labels[ny, nx] == target_label
                    ):
                        visited[ny, nx] = True
                        queue.append((ny, nx))

            if len(component) >= min_size:
                continue

            neighbor_counts: Counter = Counter()
            for cy, cx in component:
                for dy, dx in NEIGHBORS:
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < height and 0 <= nx < width:
                        neighbor_label = labels[ny, nx]
                        if neighbor_label != target_label:
                            neighbor_counts[neighbor_label] += 1

            if not neighbor_counts:
                continue

            replacement, _ = neighbor_counts.most_common(1)[0]
            for cy, cx in component:
                labels[cy, cx] = replacement

    return labels


def region_label_position(label_img, region: Region) -> tuple[int, int]:
    labels = np.asarray(label_img)
    height, width = labels.shape
    best_score = -1
    best_point = region.pixels[0]

    def run_length(y: int, x: int, dy: int, dx: int) -> int:
        count = 0
        label = labels[y, x]
        ny, nx = y + dy, x + dx
        while 0 <= ny < height and 0 <= nx < width and labels[ny, nx] == label:
            count += 1
            ny += dy
            nx += dx
        return count

    for y, x in region.pixels:
        left = run_length(y, x, 0, -1)
        right = run_length(y, x, 0, 1)
        up = run_length(y, x, -1, 0)
        down = run_length(y, x, 1, 0)
        score = (left + 1) * (right + 1) * (up + 1) * (down + 1)
        if score > best_score:
            best_score = score
            best_point = (y, x)

    return best_point
