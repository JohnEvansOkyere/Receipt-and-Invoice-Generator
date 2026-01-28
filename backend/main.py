"""
FastAPI Backend for Receipt and Invoice Generator
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.database import engine, Base
from app.routers import auth, business, receipts, invoices, history, upload

# Note: Database tables are created via Alembic migrations
# Run: alembic upgrade head
# For development, you can uncomment the line below to auto-create tables
# Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    # Tables are created via migrations (alembic upgrade head)
    # Uncomment below only for quick development/testing
    # Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    pass

app = FastAPI(
    title="Receipt & Invoice Generator API",
    description="Backend API for professional receipt and invoice generation",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(business.router, prefix="/api/business", tags=["Business"])
app.include_router(receipts.router, prefix="/api/receipts", tags=["Receipts"])
app.include_router(invoices.router, prefix="/api/invoices", tags=["Invoices"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])

# Serve uploaded files
if os.path.exists("uploads"):
    app.mount("/api/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {"message": "Receipt & Invoice Generator API", "status": "running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
