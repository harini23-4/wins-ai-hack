# app/matching_engine.py
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models import Profile

def find_collaborators(db: Session, profile: Profile, top_k: int = 5):
    if profile.embedding is None:
        return []  # profile was never embedded — nothing to compare

    stmt = (
        select(Profile, Profile.embedding.cosine_distance(profile.embedding).label("distance"))
        .where(Profile.id != profile.id)
        .order_by("distance")
        .limit(top_k * 3)
    )
    results = db.execute(stmt).all()

    if not results:
        return []  # no other profiles exist yet — empty pool

    scored = []
    for candidate, distance in results:
        similarity =float(1 - distance)
        overlap = set(profile.interests or []) & set(candidate.interests or [])
        complementary = set(profile.expertise or []) - set(candidate.expertise or [])
        score = similarity + 0.05 * len(complementary) - (0.05 if candidate.institution == profile.institution else 0)
        scored.append({
            "profile": candidate,
            "score": round(score, 4),
            "shared_interests": list(overlap),
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k]