from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routers import profiles, tracker

# Hackathon speed: create tables directly from models on boot.
# (Alembic migrations are also set up in /alembic for anyone who wants
#  proper versioned migrations against Postgres — see README.)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Research Collaboration & Tracker API",
    description="Profile/matching engine, funding recommendations, and project tracker.",
    version="1.0.0",
)

# Wide-open CORS for the hackathon so any frontend origin can call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profiles.router)
app.include_router(tracker.router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def root():
    return {"message": "Research Collaboration & Tracker API is running — see /docs for the interactive API contract."}