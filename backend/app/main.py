from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os

# Load environment variables from .env file
# The .env file is in the project root, so we need to go up two directories
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

# Load .env from project root
load_dotenv(dotenv_path=project_root / ".env")

from app.database import init_db, engine
from app.routers import auth, ingredients, recipes, shopping_lists, rag


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler for FastAPI application.
    Handles startup and shutdown events.
    """
    # Startup
    print("Starting up SmartKitchen API...")
    print("Database connection established")
    yield
    # Shutdown
    print("Shutting down SmartKitchen API...")
    engine.dispose()


app = FastAPI(
    title="SmartKitchen API",
    description="Smart Kitchen Management System with Magic Link Authentication",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware configuration
# Note: When allow_credentials=True, allow_origins cannot be "*"
# Must specify exact origins for security
allowed_origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",   # Alternative dev port
    "https://plankton-app-zvzg5.ondigitalocean.app",  # Production frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(ingredients.router, prefix="/ingredients", tags=["Ingredients"])
app.include_router(recipes.router, prefix="/recipes", tags=["Recipes"])
app.include_router(shopping_lists.router, prefix="/shopping-lists", tags=["Shopping Lists"])
app.include_router(rag.router, prefix="/rag", tags=["RAG (AI Recommendations)"])


@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "SmartKitchen API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    from app.database import db_manager

    db_healthy = db_manager.health_check()

    return {
        "status": "healthy" if db_healthy else "unhealthy",
        "database": "connected" if db_healthy else "disconnected"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)