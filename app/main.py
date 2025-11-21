import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.generate import router as generate_router


def create_app() -> FastAPI:
    """Application factory so tests can instantiate the API easily."""
    app = FastAPI(title="Paint-By-Number Engine")

    # Allow specific origins for the frontend; defaults cover Render static + local dev.
    default_origins = [
        "https://paint-by-number-engine-1.onrender.com",
        "https://paint-by-number-engine.onrender.com",
        "http://localhost:5173",
        "http://localhost:4173",
    ]
    allowed_origins = (
        os.environ.get("PBN_ALLOWED_ORIGINS", "")
        or ",".join(default_origins)
    )
    origins = [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=False,  # keep false while using wildcards; set true only with specific origins if needed
        allow_methods=["*"],
        allow_headers=["*"],
        max_age=600,
    )

    @app.get("/health")
    async def health_check() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(generate_router)

    return app


app = create_app()
