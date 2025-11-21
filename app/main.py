from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.generate import router as generate_router


def create_app() -> FastAPI:
    """Application factory so tests can instantiate the API easily."""
    app = FastAPI(title="Paint-By-Number Engine")

    # Note: wildcard origins require allow_credentials=False per CORS spec.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
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
