"""Configuration stubs for future environment-based settings."""

from pydantic import BaseModel


class Settings(BaseModel):
    default_max_width: int = 1200
    default_num_colors: int = 10


settings = Settings()
