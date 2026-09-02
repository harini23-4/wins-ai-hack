from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/profiles", tags=["profiles"])


# ---------------- CRUD ----------------

@router.post("/", response_model=schemas.ProfileOut)
def create_profile(payload: schemas.ProfileCreate, db: Session = Depends(get_db)):
    if db.query(models.Profile).filter(models.Profile.email == payload.email).first():
        raise HTTPException(400, "Profile with this email already exists")
    profile = models.Profile(**payload.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/", response_model=List[schemas.ProfileOut])
def list_profiles(db: Session = Depends(get_db)):
    return db.query(models.Profile).all()


@router.get("/{profile_id}", response_model=schemas.ProfileOut)
def get_profile(profile_id: int, db: Session = Depends(get_db)):
    profile = db.get(models.Profile, profile_id)
    if not profile:
        raise HTTPException(404, "Profile not found")
    return profile


@router.put("/{profile_id}", response_model=schemas.ProfileOut)
def update_profile(profile_id: int, payload: schemas.ProfileUpdate, db: Session = Depends(get_db)):
    profile = db.get(models.Profile, profile_id)
    if not profile:
        raise HTTPException(404, "Profile not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    return profile


@router.delete("/{profile_id}")
def delete_profile(profile_id: int, db: Session = Depends(get_db)):
    profile = db.get(models.Profile, profile_id)
    if not profile:
        raise HTTPException(404, "Profile not found")
    db.delete(profile)
    db.commit()
    return {"deleted": True}


# ---------------- Matching engine (tag-overlap / Jaccard similarity) ----------------
# This is a working baseline so the demo is functional end-to-end on day 1.
# The matching-engine teammate can swap the scoring function below (e.g. for
# embeddings/cosine similarity) without changing the endpoint or response shape,
# so nothing else in the app has to change.

def _jaccard(a: set, b: set) -> float:
    if not a or not b:
        return 0.0
    union = a | b
    return len(a & b) / len(union) if union else 0.0


@router.get("/{profile_id}/matches", response_model=List[schemas.CollaboratorMatch])
def get_collaborator_matches(profile_id: int, top_n: int = 5, db: Session = Depends(get_db)):
    target = db.get(models.Profile, profile_id)
    if not target:
        raise HTTPException(404, "Profile not found")
    target_tags = target.tag_set()

    results = []
    for other in db.query(models.Profile).filter(models.Profile.id != profile_id).all():
        other_tags = other.tag_set()
        score = _jaccard(target_tags, other_tags)
        if score > 0:
            shared = sorted(target_tags & other_tags)
            results.append(schemas.CollaboratorMatch(profile=other, score=round(score, 3), shared_tags=shared))

    results.sort(key=lambda r: r.score, reverse=True)
    return results[:top_n]


@router.get("/{profile_id}/funding-recommendations", response_model=List[schemas.FundingMatch])
def get_funding_recommendations(profile_id: int, top_n: int = 5, db: Session = Depends(get_db)):
    target = db.get(models.Profile, profile_id)
    if not target:
        raise HTTPException(404, "Profile not found")
    target_tags = target.tag_set()

    results = []
    for grant in db.query(models.Grant).all():
        grant_tags = grant.tag_set()
        score = _jaccard(target_tags, grant_tags)
        if score > 0:
            matched = sorted(target_tags & grant_tags)
            results.append(schemas.FundingMatch(grant=grant, score=round(score, 3), matched_tags=matched))

    results.sort(key=lambda r: r.score, reverse=True)
    return results[:top_n]