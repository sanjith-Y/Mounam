"""
MOUNAM - AI-Powered Assistive Communication Platform
FastAPI Backend Entrypoint
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.health import router as health_router
from app.routes.auth import router as auth_router
from app.routes.dashboard import router as dashboard_router
from app.routes.communication import router as communication_router
from app.routes.languages import router as languages_router
from app.routes.ai import router as ai_router
from app.routes.feedback import router as feedback_router

app = FastAPI(
    title="MOUNAM API",
    description="AI-Powered Assistive Communication Platform backend API. Tagline: 'Every Voice Deserves to Be Heard.'",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for local development & single-URL production frontend connectivity
frontend_url = os.getenv("FRONTEND_URL", "").strip()
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:4173",
]
if frontend_url and frontend_url not in origins:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "MOUNAM API is running",
        "status": "success"
    }

# Register API routers
app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(communication_router, prefix="/api")
app.include_router(languages_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(feedback_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
