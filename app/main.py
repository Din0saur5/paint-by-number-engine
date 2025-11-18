from fastapi import FastAPI


def create_app() -> FastAPI:
    """Application factory so tests can instantiate the API easily."""
    app = FastAPI(title="Paint-By-Number Engine")

    @app.get("/health")
    async def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
