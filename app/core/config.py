"""Configuration stubs for future environment-based settings."""

from pydantic import BaseModel


class Settings(BaseModel):
    # Print layouts assume US Letter @ 300 DPI (~2550x3300 px)
    letter_width_px: int = 2550
    letter_height_px: int = 3300
    default_max_width: int = 2550
    default_num_colors: int = 10
    min_region_size: int = 300  # pixels; small blobs below this will be merged
    min_colors: int = 3
    max_colors: int = 30
    min_width: int = 400
    max_width: int = 4000
    max_upload_bytes: int = 15 * 1024 * 1024


settings = Settings()
