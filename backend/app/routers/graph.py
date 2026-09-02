# app/routers/graph.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.graph_engine import build_graph

router = APIRouter(prefix="/api")

@router.get("/graph")
def get_graph(db: Session = Depends(get_db)):
    return build_graph(db)