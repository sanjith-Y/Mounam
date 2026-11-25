from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check():
    """Health check endpoint to verify backend service status."""
    return {
        "status": "healthy",
        "service": "mounam-backend",
        "version": "1.0.0",
        "timestamp": "2026-11-19T20:35:50Z"
    }
