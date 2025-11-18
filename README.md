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
