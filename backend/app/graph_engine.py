# app/graph_engine.py
from sqlalchemy.orm import Session
from app.models import Profile
import itertools

SIMILARITY_THRESHOLD = 0.55

def build_graph(db: Session):
    profiles = db.query(Profile).all()

    nodes = [
        {
            "id": str(p.id),
            "name": p.name,
            "institution": p.institution,
            "career_stage": p.career_stage,
        }
        for p in profiles
    ]

    edges = []
    for a, b in itertools.combinations(profiles, 2):
        similarity = float(sum(x * y for x, y in zip(a.embedding, b.embedding)))  # cast to native float
        if similarity >= SIMILARITY_THRESHOLD:
            shared = list(set(a.interests) & set(b.interests))
            edges.append({
                "source": str(a.id),
                "target": str(b.id),
                "weight": round(similarity, 3),
                "shared_interests": shared,
            })

    return {"nodes": nodes, "edges": edges}