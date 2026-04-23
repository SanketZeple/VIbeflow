from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth_router, board_router, reports_router

app = FastAPI(title="Backend API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(board_router, prefix="/api")
app.include_router(reports_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the API"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}