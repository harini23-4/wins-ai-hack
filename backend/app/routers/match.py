# app/routers/match.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import matching_engine, funding_engine
from app.rationale import generate_match_rationale
from app.models import Profile
from uuid import UUID

router = APIRouter(prefix="/api")

@router.get("/profiles/{profile_id}/matches")
def get_matches(profile_id: UUID, db: Session = Depends(get_db)):
    profile = db.get(Profile, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    try:
        collaborators = matching_engine.find_collaborators(db, profile)
        grants = funding_engine.find_grants(db, profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matching failed: {str(e)}")

    return {
        "profile_id": str(profile_id),
        "collaborators": [
            {
                "id": str(c["profile"].id),
                "name": c["profile"].name,
                "score": c["score"],
                "shared_interests": c["shared_interests"],
                "rationale": generate_match_rationale(profile, c["profile"], c["shared_interests"]),
            } for c in collaborators
        ],
        "funding": [
            {
                "id": str(g["grant"].id),
                "title": g["grant"].title,
                "funder": g["grant"].funder,
                "score": g["score"],
            } for g in grants
        ],
    }