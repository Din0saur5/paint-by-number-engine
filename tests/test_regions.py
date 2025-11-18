import numpy as np

from app.services.image_pipeline.regions import merge_small_regions, find_regions, region_label_position


def test_merge_small_regions_removes_isolated_pixels():
    labels = np.array(
        [
            [0, 0, 0],
            [0, 1, 0],
            [0, 0, 0],
        ]
    )

    merged = merge_small_regions(labels, min_size=2)

    assert np.all(merged == 0)


def test_merge_small_regions_respects_large_components():
    labels = np.array(
        [
            [0, 0, 0, 2],
            [0, 1, 1, 2],
            [0, 1, 1, 2],
        ]
    )

    merged = merge_small_regions(labels, min_size=3)

    assert merged[0, 3] == 2  # untouched large region
    assert np.all(merged[:, :3] == labels[:, :3])  # large component unchanged


def test_find_regions_and_label_position():
    labels = np.array(
        [
            [0, 0, 1],
            [0, 0, 1],
            [2, 2, 1],
        ]
    )
    regions = find_regions(labels)
    assert len(regions) == 3
    for region in regions:
        y, x = region_label_position(labels, region)
        assert labels[y, x] == region.label
