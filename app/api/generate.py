from fastapi import APIRouter


router = APIRouter(prefix="/generate", tags=["generate"])


@router.get("/", summary="Placeholder generate endpoint")
async def placeholder_generate() -> dict[str, str]:
    return {"detail": "Not implemented yet"}
