from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.routers import summary, works, analytics, filters

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for MPLADS AI-Powered Anomaly Detection & Monitoring System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(summary.router)
app.include_router(works.router)
app.include_router(analytics.router)
app.include_router(filters.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "interpretation_policy": "An anomaly or risk score indicates an unusual pattern requiring human review. It does not prove fraud, corruption, or wrongdoing.",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "healthy", "service": "mplads-backend"}
