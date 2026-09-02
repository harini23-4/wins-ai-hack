# app/routers/profiles.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.models import Profile
from app.schemas import ProfileCreate, ProfileOut
from app.embeddings import embed_text, profile_to_text

router = APIRouter(prefix="/api/profiles", tags=["profiles"])

@router.post("/", response_model=ProfileOut)
def create_profile(payload: ProfileCreate, db: Session = Depends(get_db)):
    try:
        profile = Profile(**payload.model_dump())
        profile.embedding = embed_text(profile_to_text(profile))
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create profile: {str(e)}")

@router.get("/", response_model=list[ProfileOut])
def list_profiles(db: Session = Depends(get_db)):
    return db.query(Profile).all()

@router.get("/{profile_id}", response_model=ProfileOut)
def get_profile(profile_id: UUID, db: Session = Depends(get_db)):
    profile = db.get(Profile, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile