"""Configuration stubs for future environment-based settings."""

from pydantic import BaseModel


class Settings(BaseModel):
    # Print layouts assume US Letter @ 300 DPI (~2550x3300 px)
    letter_width_px: int = 2550
    letter_height_px: int = 3300
    default_max_width: int = 2550
    default_num_colors: int = 10


settings = Settings()
