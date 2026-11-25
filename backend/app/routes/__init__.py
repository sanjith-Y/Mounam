from .health import router as health_router
from .auth import router as auth_router
from .dashboard import router as dashboard_router
from .communication import router as communication_router
from .languages import router as languages_router
from .ai import router as ai_router

__all__ = [
    "health_router",
    "auth_router",
    "dashboard_router",
    "communication_router",
    "languages_router",
    "ai_router"
]
