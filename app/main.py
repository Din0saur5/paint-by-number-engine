from fastapi import FastAPI

from app.api.generate import router as generate_router


def create_app() -> FastAPI:
    """Application factory so tests can instantiate the API easily."""
    app = FastAPI(title="Paint-By-Number Engine")

    @app.get("/health")
    async def health_check() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(generate_router)

    return app


app = create_app()
