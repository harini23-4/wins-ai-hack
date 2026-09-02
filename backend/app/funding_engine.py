# app/funding_engine.py
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models import Grant, Profile
import datetime

def find_grants(db: Session, profile: Profile, top_k: int = 5):
    stmt = (
        select(Grant, Grant.embedding.cosine_distance(profile.embedding).label("distance"))
        .where(Grant.deadline >= datetime.datetime.utcnow())
        .order_by("distance")
        .limit(top_k * 3)
    )
    results = db.execute(stmt).all()

    scored = []
    for grant, distance in results:
        similarity =float( 1 - distance)
        eligible = (
            not grant.eligible_career_stages
            or profile.career_stage in grant.eligible_career_stages
        )
        if not eligible:
            continue
        scored.append({"grant": grant, "score": round(similarity, 4)})

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k]