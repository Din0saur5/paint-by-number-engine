# Paint-By-Number Image Engine

Minimal FastAPI backend skeleton that will power the paint-by-number converter described in `docs/`.

## Requirements
- Python 3.11 (managed via `pyenv`)
- Pipenv

## Local Setup
1. `pyenv local 3.11.6` (or run `pyenv install 3.11.6` if it is missing)
2. `pipenv install` to create the virtualenv and install dependencies
3. `pipenv run uvicorn app.main:app --reload`
4. Visit `http://127.0.0.1:8000/health` and you should see `{"status": "ok"}`

Keep iterating with the roadmap in `docs/pr-roadmap.md`.

## Configuration
Runtime settings come from environment variables (prefixed with `PBN_`) or a local `.env` file at the repository root. Key variables:

| Variable | Default | Description |
| --- | --- | --- |
| `PBN_DEFAULT_NUM_COLORS` | `10` | Default number of paint colors |
| `PBN_DEFAULT_MAX_WIDTH` | `2550` | Default resize width for uploads (px) |
| `PBN_MIN_REGION_SIZE` | `300` | Minimum pixels per region before merging |
| `PBN_MIN_COLORS` / `PBN_MAX_COLORS` | `3` / `30` | Allowed range for `num_colors` |
| `PBN_MIN_WIDTH` / `PBN_MAX_WIDTH` | `400` / `4000` | Allowed range for `max_width` |
| `PBN_MAX_UPLOAD_BYTES` | `15728640` | Max upload size in bytes (15 MB) |

Example `.env`:

```
PBN_DEFAULT_NUM_COLORS=12
PBN_MIN_REGION_SIZE=500
PBN_MAX_UPLOAD_BYTES=10485760
```

## Common Commands
- `make format` → run Black on `app/` and `tests/`
- `make lint` → run Ruff checks
- `make test` → run the pytest suite
