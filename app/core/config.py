"""Application configuration loaded from environment or .env."""

from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for the API."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="PBN_",
        env_file_encoding="utf-8",
    )

    # Print layouts assume US Letter @ 300 DPI (~2550x3300 px)
    letter_width_px: int = Field(2550, description="Canvas width for Letter paper at 300 DPI")
    letter_height_px: int = Field(3300, description="Canvas height for Letter paper at 300 DPI")

    default_max_width: int = Field(2550, description="Default width cap for uploaded images")
    default_num_colors: int = Field(10, description="Default number of paint colors")
    min_region_size: int = Field(300, description="Minimum region size before merging")

    min_colors: int = Field(3, description="Minimum allowed num_colors value")
    max_colors: int = Field(16, description="Maximum allowed num_colors value")

    min_width: int = Field(400, description="Minimum allowed max_width value")
    max_width: int = Field(4000, description="Maximum allowed max_width value")

    max_upload_bytes: int = Field(15 * 1024 * 1024, description="Upload size limit in bytes")


settings = Settings()
