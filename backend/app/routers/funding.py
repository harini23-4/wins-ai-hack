# app/routers/funding.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.models import Profile
from app import funding_engine

router = APIRouter(prefix="/api")

@router.get("/profiles/{profile_id}/funding")
def get_funding_matches(profile_id: UUID, db: Session = Depends(get_db)):
    profile = db.get(Profile, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    try:
        grants = funding_engine.find_grants(db, profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Funding match failed: {str(e)}")

    return {
        "profile_id": str(profile_id),
        "funding": [
            {
                "id": str(g["grant"].id),
                "title": g["grant"].title,
                "funder": g["grant"].funder,
                "amount_min": g["grant"].amount_min,
                "amount_max": g["grant"].amount_max,
                "deadline": g["grant"].deadline.isoformat() if g["grant"].deadline else None,
                "score": g["score"],
            } for g in grants
        ],
    }