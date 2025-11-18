# Paint-By-Number Image Engine — Build Spec

## Target Environment
- Python 3.11 managed with `pyenv`
- Dependency management via Pipenv
- FastAPI backend that exposes a single `/generate` endpoint
- No Docker requirement for the MVP

## 1. Overview
We are building a lightweight backend service that accepts an uploaded image plus a few options, converts it into a paint-by-numbers template (reduced colors, crisp outlines, numbered regions), and returns a printable PNG that fits standard 8.5" × 11" (Letter) copy paper. This API will power:
- A web app (first client)
- A future React Native client that reuses the same endpoint

## 2. Goals and Non-Goals
**Goals**
- Provide a single POST `/generate` endpoint
- Support user options:
  - `num_colors` – controls cluster count for quantization
  - `max_width` – bounds the image size for performance
- Produce outputs with clear outlines, readable numbers, and printer-friendly dimensions sized for Letter paper (target ≈2550×3300 px @ 300 DPI, respecting aspect ratio)
- Keep local development simple: `pyenv` + Pipenv, minimal services

**Out of scope for MVP**
- Accounts, history, or payments
- Manual editing tools
- Persistent storage (results can be streamed back in-memory)

## 3. Tech Stack
- **Language**: Python 3.11
- **Framework**: FastAPI served by uvicorn
- **Image / numeric libs**: Pillow, NumPy, scikit-learn (optional: OpenCV later)
- **Packaging**: Pipenv (`Pipfile`, `Pipfile.lock`)

## 4. Local Development
1. `pyenv local 3.11.x`
2. `pipenv install`
3. `pipenv run uvicorn app.main:app --reload` (serves on `http://127.0.0.1:8000`)

## 5. Architecture
```
paint-by-number-engine/
├── .python-version
├── Pipfile
├── Pipfile.lock
├── README.md
└── app/
    ├── main.py                 # FastAPI app + routers
    ├── api/
    │   └── generate.py         # /generate endpoint
    ├── core/
    │   └── config.py           # settings + env overrides
    └── services/
        └── image_pipeline/
            ├── io.py           # load + resize
            ├── quantize.py     # color clustering
            ├── outline.py      # border detection
            └── numbering.py    # label placement
```

## 6. API (MVP)
- **Endpoint**: `POST /generate/`
- **Request**: `multipart/form-data`
  - `file` (required) – PNG/JPEG upload
  - `num_colors` (optional, int; default 10; allowed 3–30)
  - `max_width` (optional, int; default 1200; allowed 400–4000)
- **Response**: `200 OK` with PNG body containing outlines + numbered regions
- **Errors**:
  - `400 Bad Request` for validation issues (missing file, invalid ranges, MIME issues)
  - `500` for unexpected errors (log everything)
- **Future extensions**: JSON metadata (palette, URLs), SVG/PDF outputs

## 7. Processing Pipeline
1. **Load & Normalize (`io.py`)**
   - Pillow loads file, converts to RGB, enforces `max_width`
2. **Color Quantization (`quantize.py`)**
   - NumPy array flattening + `sklearn.cluster.KMeans`
   - Returns `label_img` (H×W ints) and `palette` (`k × 3` colors)
3. **Outline Generation (`outline.py`)**
   - Compare each pixel with 4-neighbors, mark borders black on white canvas
4. **Number Placement (`numbering.py`)**
   - Per cluster: compute centroid, draw small white box + black text (`cluster_id + 1`)
5. **Response Assembly**
   - Convert to a PNG sized to fit within an 8.5" × 11" canvas (maintain aspect ratio, optional padding) and stream via FastAPI `StreamingResponse`

## 8. Configuration
Centralize in `app/core/config.py` (simple dataclass or `pydantic-settings`).
- `DEFAULT_MAX_WIDTH` (≈1200)
- `DEFAULT_NUM_COLORS` (≈10)
- `MAX_WIDTH_LIMIT` (≈4000)
- `MAX_COLORS_LIMIT` (≈30)
- `MAX_UPLOAD_BYTES` (≈10–15 MB)
Defaults live in code with `.env` overrides per environment.

## 9. Deployment (No Docker)
1. Ensure host supports Python + uvicorn (Render, Railway, etc.)
2. `pip install pipenv && pipenv install --deploy --system`
3. Run `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## 10. Testing and Quality
- **Unit tests**
  - `tests/test_io.py` – resizing behavior
  - `tests/test_quantize.py` – shapes + palette results
  - `tests/test_outline.py` – expected borders on toy data
  - `tests/test_numbering.py` – numbers drawn without errors
- **Integration**
  - `tests/test_generate_endpoint.py` – happy path + validation failures
- **Commands**
  - `pipenv run pytest`
  - Optional: `pipenv run ruff .`, `pipenv run black .`

## 11. Non-Functional Requirements
- **Performance**: ≤5 s for ≤1200 px width and ≤20 colors
- **Reliability**: Return explicit 4xx for bad input, avoid unhandled exceptions
- **Security**: Enforce upload size + MIME checks, no disk writes
- **Scalability**: Stateless HTTP service; horizontal scaling later; background jobs optional

## 12. Future Enhancements
- Better region logic (connected components, merge tiny specks)
- Additional outputs (SVG, PDF, palette JSON/legend)
- Storage integration (R2, Supabase) with signed URLs
- Auth/rate limiting, usage history, and themed style presets
