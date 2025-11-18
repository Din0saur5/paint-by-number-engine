# PR Roadmap

Each PR builds toward the paint-by-number engine MVP without overwhelming reviewers.

## PR 1 — Bootstrap Repo (pyenv + Pipenv + FastAPI)
- **Title**: `chore: initialize fastapi project with pyenv and pipenv`
- **Scope**:
  - Add `.python-version` (e.g., 3.11.6)
  - Initialize Pipenv with FastAPI + `uvicorn[standard]`
  - Scaffold `app/__init__.py` and `app/main.py`
  - Implement `GET /health` returning `{"status": "ok"}`
  - Document setup commands in README (`pyenv local`, `pipenv install`, dev server run)
- **Acceptance**:
  - `pipenv run uvicorn app.main:app --reload` starts cleanly
  - `/health` returns 200 with the payload
  - README instructions are clear

## PR 2 — Image Dependencies + Layout
- **Title**: `chore: add image processing deps and pipeline skeleton`
- **Scope**:
  - Install Pillow, NumPy, and scikit-learn
  - Create API/core/services directory tree with stubs (`generate.py`, `config.py`, `io.py`, `quantize.py`, `outline.py`, `numbering.py`)
  - Wire `app/main.py` to include a placeholder router import
- **Acceptance**:
  - App boots without errors
  - Imports from `app.services.image_pipeline` succeed
  - Pipfile lists the new dependencies

## PR 3 — Load + Resize Utility
- **Title**: `feat: implement image load and resize utility`
- **Scope**:
  - Implement `load_and_resize(image_file, max_width)` in `io.py`
  - Add tests verifying wide images downscale and smaller ones stay unchanged
- **Acceptance**:
  - `pipenv run pytest` passes
  - JPEG and PNG samples round-trip through the helper
  - App startup remains unaffected

## PR 4 — Color Quantization
- **Title**: `feat: add k-means color quantization`
- **Scope**:
  - Implement `quantize_colors(img, k)` using `sklearn.cluster.KMeans`
  - Return `(label_img, palette)` with correct shapes
  - Cover behavior with synthetic image tests
- **Acceptance**:
  - Quantization runs within ~1 s on small fixtures
  - Tests green for k in the 5–20 range

## PR 5 — Raster Outline Generation
- **Title**: `feat: generate raster outlines from label map`
- **Scope**:
  - Implement `make_outline_image(label_img)` by marking neighbor differences black
  - Add tests that assert borders for small grids
- **Acceptance**:
  - Produces valid Pillow output
  - Manual script can save an outline that visually matches expectations

## PR 6 — Number Placement
- **Title**: `feat: add basic per-color number placement`
- **Scope**:
  - Implement `add_numbers(outline_img, label_img, palette)`
  - For each cluster, find centroid, draw white box, render `cluster_id + 1`
  - Smoke tests ensure the image changes and no exceptions occur
- **Acceptance**:
  - Numbers appear near region centers on sample images
  - Tests pass

## PR 7 — `/generate` Endpoint Wiring
- **Title**: `feat: expose /generate endpoint for paint-by-numbers`
- **Scope**:
  - Build FastAPI router that handles multipart form (`file`, `num_colors`, `max_width`)
  - Invoke pipeline steps and stream PNG via `StreamingResponse`
  - Include router under `/generate` in `app/main.py`
- **Acceptance**:
  - Running the server and POSTing an image returns 200 with outlines + numbers
  - Output PNG fits within a Letter-sized canvas (≈2550×3300 px) so it prints on 8.5" × 11" paper without scaling surprises

## PR 8 — Validation + Error Handling
- **Title**: `feat: add request validation and error handling for /generate`
- **Scope**:
  - Enforce `num_colors` (3–30) and `max_width` (400–4000)
  - Reject non-image MIME types and oversize uploads (when possible)
  - Raise FastAPI `HTTPException` for user errors
  - Extend tests for validation failures
- **Acceptance**:
  - Invalid requests yield 400s with descriptive detail
  - Tests cover missing file, bad ranges, MIME issues

## PR 9 — Config + Environment Management
- **Title**: `chore: centralize settings with config module`
- **Scope**:
  - Implement `app/core/config.py` (dataclass or `pydantic-settings`)
  - Track defaults (`DEFAULT_MAX_WIDTH`, `DEFAULT_NUM_COLORS`, etc.) with `.env` overrides
  - `/generate` uses config defaults when values omitted
  - README documents environment variables
- **Acceptance**:
  - Changing `.env` updates runtime defaults
  - Tests still pass

## PR 10 — Testing + Linting Tooling
- **Title**: `chore: add pytest and linting to project`
- **Scope**:
  - Ensure Pipenv installs pytest plus lint tools (ruff/flake8, black)
  - Add `pytest.ini`/`pyproject.toml` and lint config
  - Document commands or provide a Makefile
  - (Optional) GitHub Actions workflow for install + test + lint
- **Acceptance**:
  - `pipenv run pytest` and lint commands succeed locally/CI
  - CI runs automatically on PRs

## Future PR Ideas
- SVG/PDF export formats
- Region merging to eliminate tiny specks
- Palette JSON + legend endpoint
- Storage integrations (R2, Supabase) with signed URLs
