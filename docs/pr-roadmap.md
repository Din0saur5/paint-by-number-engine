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

## PR 8 — Palette Metadata & Legend
- **Title**: `feat: return palette metadata and legend PDF with generate responses`
- **Scope**:
  - Collect palette information from quantization (number, RGB, HEX)
  - Include palette metadata in the `/generate` JSON response so the UI can render a legend inline
  - Render a minimal server-generated legend PDF (Letter size) listing each color number, RGB/HEX values, and a swatch; include the PDF in the response (base64 or multipart)
  - Add tests ensuring palette payload aligns with numbering and that the PDF creation hooks are exercised
- **Acceptance**:
  - Each response documents every color ID + RGB/HEX pair
  - Clients can show a legend immediately and users can download/print the PDF without extra work

## PR 9 — Region-Aware Number Placement
- **Title**: `feat: adopt region-based numbering inspired by pbnify`
- **Scope**:
  - Implement connected-component detection on label maps (BFS/flood fill)
  - Merge regions below a configurable pixel threshold into their neighbors (similar to pbnify’s region merging)
  - For each remaining region, compute an interior point using a heuristic like pbnify’s run-length product (`getLabelLoc`) and render the number directly at that spot (no big circles)
  - Optionally add a smoothing pass before outlining to help region detection
- **Acceptance**:
  - Each distinct region gets a number placed inside its boundaries
  - Numbers are legible and no longer float outside the shapes they refer to

## PR 10 — Validation + Error Handling
- **Title**: `feat: add request validation and error handling for /generate`
- **Scope**:
  - Enforce `num_colors` (3–30) and `max_width` (400–4000)
  - Reject non-image MIME types and oversize uploads (when possible)
  - Raise FastAPI `HTTPException` for user errors
  - Extend tests for validation failures
- **Acceptance**:
  - Invalid requests yield 400s with descriptive detail
  - Tests cover missing file, bad ranges, MIME issues

## PR 11 — Config + Environment Management
- **Title**: `chore: centralize settings with config module`
- **Scope**:
  - Implement `app/core/config.py` (dataclass or `pydantic-settings`)
  - Track defaults (`DEFAULT_MAX_WIDTH`, `DEFAULT_NUM_COLORS`, etc.) with `.env` overrides
  - `/generate` uses config defaults when values omitted
  - README documents environment variables
- **Acceptance**:
  - Changing `.env` updates runtime defaults
  - Tests still pass

## PR 12 — Testing + Linting Tooling
- **Title**: `chore: add pytest and linting to project`
- **Scope**:
  - Ensure Pipenv installs pytest plus lint tools (ruff/flake8, black)
  - Add `pytest.ini`/`pyproject.toml` and lint config
  - Document commands or provide a Makefile
  - (Optional) GitHub Actions workflow for install + test + lint
- **Acceptance**:
  - `pipenv run pytest` and lint commands succeed locally/CI
  - CI runs automatically on PRs

## PR 13 — Painted Preview Output
- **Title**: `feat: generate filled-in paint preview alongside line art`
- **Scope**:
  - After quantization + region smoothing, render a second PNG where each region is filled with its palette color (optionally overlay faint outlines/numbers)
  - Include this preview in the `/generate` response (e.g., additional base64 blob) and expose it via the sample output script so users can visualize the finished painting before printing
  - Add a regression test ensuring the preview uses the same palette mapping as the legend
- **Acceptance**:
  - Responses include both the line-art sheet and a colored preview
  - Palette colors and numbers line up between preview, sheet, and legend

## Future PR Ideas
- SVG/PDF export formats
- Region merging to eliminate tiny specks
- Palette JSON + legend endpoint
- Storage integrations (R2, Supabase) with signed URLs
