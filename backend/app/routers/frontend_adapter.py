# app/routers/frontend_adapter.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import get_db
from app.models import Profile, Grant, Project, Milestone
from app.embeddings import embed_text
from datetime import datetime, timezone

router = APIRouter(prefix="/api", tags=["frontend-adapter"])


def profile_to_dict(p: Profile):
    return {
        "id": str(p.id), "name": p.name, "institution": p.institution,
        "career_stage": p.career_stage, "interests": p.interests or [],
        "expertise": p.expertise or [], "bio": p.bio,
    }

def grant_to_dict(g: Grant):
    return {
        "id": str(g.id), "title": g.title, "funder": g.funder,
        "description": g.description, "keywords": g.keywords or [],
        "amount_min": g.amount_min, "amount_max": g.amount_max,
        "deadline": g.deadline.isoformat() if g.deadline else None,
    }


@router.get("/profiles")   # matches frontend's exact "/api/profiles" (no slash)
def list_profiles_no_slash(db: Session = Depends(get_db)):
    return [profile_to_dict(p) for p in db.query(Profile).all()]


@router.post("/match/collaborators")
def match_collaborators(payload: dict, db: Session = Depends(get_db)):
    profile_data = payload.get("profile", {})
    interests = profile_data.get("interests", [])
    expertise = profile_data.get("expertise", [])
    bio = profile_data.get("bio", "")
    text = f"Interests: {', '.join(interests)}. Expertise: {', '.join(expertise)}. Bio: {bio}"
    query_embedding = embed_text(text)

    exclude_id = profile_data.get("id")
    candidates = db.query(Profile).all()

    results = []
    for c in candidates:
        if exclude_id and str(c.id) == str(exclude_id):
            continue
        similarity = float(sum(x * y for x, y in zip(query_embedding, c.embedding)))
        shared_interests = list(set(interests) & set(c.interests or []))
        shared_expertise = list(set(expertise) & set(c.expertise or []))
        results.append({
            "profile": profile_to_dict(c),
            "score": round(similarity, 4),
            "sharedInterests": shared_interests,
            "sharedExpertise": shared_expertise,
            "sameInstitution": c.institution == profile_data.get("institution"),
        })

    results.sort(key=lambda r: r["score"], reverse=True)
    return results[:10]


@router.post("/match/funding")
def match_funding(payload: dict, db: Session = Depends(get_db)):
    profile_data = payload.get("profile", {})
    interests = profile_data.get("interests", [])
    expertise = profile_data.get("expertise", [])
    bio = profile_data.get("bio", "")
    career_stage = profile_data.get("career_stage")
    text = f"Interests: {', '.join(interests)}. Expertise: {', '.join(expertise)}. Bio: {bio}"
    query_embedding = embed_text(text)

    grants = db.query(Grant).all()
    now = datetime.now(timezone.utc)

    results = []
    for g in grants:
        similarity = float(sum(x * y for x, y in zip(query_embedding, g.embedding)))
        matched_tags = list(set(interests + expertise) & set(g.keywords or []))
        eligible = (not g.eligible_career_stages) or (career_stage in (g.eligible_career_stages or []))
        deadline = g.deadline.replace(tzinfo=timezone.utc) if g.deadline and g.deadline.tzinfo is None else g.deadline
        days_to_deadline = (deadline - now).days if deadline else None
        results.append({
            "grant": grant_to_dict(g),
            "score": round(similarity, 4),
            "matchedTags": matched_tags,
            "eligible": eligible,
            "daysToDeadline": days_to_deadline,
        })

    results.sort(key=lambda r: r["score"], reverse=True)
    return results[:10]


@router.get("/projects")
def get_projects(ownerId: str = None, db: Session = Depends(get_db)):
    q = db.query(Project)
    if ownerId:
        q = q.filter(Project.owner_profile_id == ownerId)
    projects = q.all()

    result = []
    for p in projects:
        result.append({
            "id": str(p.id),
            "ownerId": str(p.owner_profile_id),
            "title": p.title,
            "description": p.description,
            "status": p.status,
            "collaborators": [],   # not tracked in current schema — extend Project model if needed
            "milestones": [
                {
                    "id": str(m.id),
                    "title": m.title,
                    "status": m.status,
                    "due_date": m.due_date.isoformat() if m.due_date else None,
                }
                for m in p.milestones
            ],
        })
    return result


@router.patch("/projects/{project_id}/milestones/{milestone_id}")
def update_milestone_status(project_id: str, milestone_id: str, payload: dict, db: Session = Depends(get_db)):
    milestone = db.get(Milestone, milestone_id)
    if not milestone or str(milestone.project_id) != project_id:
        raise HTTPException(404, "Milestone not found for this project")

    new_status = payload.get("status")
    if new_status == "done" and milestone.status != "done":
        milestone.completed_at = datetime.utcnow()
    milestone.status = new_status
    db.commit()

    project = db.get(Project, project_id)
    return {
        "id": str(project.id),
        "ownerId": str(project.owner_profile_id),
        "title": project.title,
        "status": project.status,
        "collaborators": [],
        "milestones": [
            {"id": str(m.id), "title": m.title, "status": m.status,
             "due_date": m.due_date.isoformat() if m.due_date else None}
            for m in project.milestones
        ],
    }