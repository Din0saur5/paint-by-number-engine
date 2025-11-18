from app.core.config import Settings


def test_env_overrides(monkeypatch):
    monkeypatch.setenv("PBN_DEFAULT_NUM_COLORS", "15")
    monkeypatch.setenv("PBN_MAX_UPLOAD_BYTES", str(5 * 1024 * 1024))

    settings = Settings()

    assert settings.default_num_colors == 15
    assert settings.max_upload_bytes == 5 * 1024 * 1024
