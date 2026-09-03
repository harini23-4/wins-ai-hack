# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import Base
from app.routers import profiles, match, graph, funding, tracker

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Researcher Matching Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profiles.router)
app.include_router(match.router)
app.include_router(graph.router)
app.include_router(funding.router)
app.include_router(tracker.router)

@app.get("/health")
def health():
    return {"status": "ok"}