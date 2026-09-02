from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["tracker"])


# ==================== Projects ====================

@router.post("/projects", response_model=schemas.ProjectOut)
def create_project(payload: schemas.ProjectCreate, db: Session = Depends(get_db)):
    if not db.get(models.Profile, payload.owner_profile_id):
        raise HTTPException(404, "Owner profile not found")
    project = models.Project(**payload.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/projects", response_model=List[schemas.ProjectOut])
def list_projects(owner_profile_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(models.Project)
    if owner_profile_id is not None:
        q = q.filter(models.Project.owner_profile_id == owner_profile_id)
    return q.all()


@router.get("/projects/{project_id}", response_model=schemas.ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.get(models.Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return project


@router.put("/projects/{project_id}", response_model=schemas.ProjectOut)
def update_project(project_id: int, payload: schemas.ProjectUpdate, db: Session = Depends(get_db)):
    project = db.get(models.Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(project, k, v)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.get(models.Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    db.delete(project)
    db.commit()
    return {"deleted": True}


@router.get("/projects/{project_id}/summary", response_model=schemas.ProjectSummary)
def project_summary(project_id: int, db: Session = Depends(get_db)):
    """Aggregated dashboard view: milestones, publications, funding, % progress."""
    project = db.get(models.Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    milestones = project.milestones
    total = len(milestones)
    done = len([m for m in milestones if m.status == "done"])
    progress = round((done / total) * 100, 1) if total else 0.0
    total_funding = sum(f.amount or 0 for f in project.funding_entries)

    return schemas.ProjectSummary(
        project=project,
        milestones=milestones,
        publications=project.publications,
        funding_secured=project.funding_entries,
        total_funding=total_funding,
        milestone_progress=progress,
    )


# ==================== Milestones ====================

@router.post("/milestones", response_model=schemas.MilestoneOut)
def create_milestone(payload: schemas.MilestoneCreate, db: Session = Depends(get_db)):
    if not db.get(models.Project, payload.project_id):
        raise HTTPException(404, "Project not found")
    m = models.Milestone(**payload.model_dump())
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@router.get("/milestones/{milestone_id}", response_model=schemas.MilestoneOut)
def get_milestone(milestone_id: int, db: Session = Depends(get_db)):
    m = db.get(models.Milestone, milestone_id)
    if not m:
        raise HTTPException(404, "Milestone not found")
    return m


@router.put("/milestones/{milestone_id}", response_model=schemas.MilestoneOut)
def update_milestone(milestone_id: int, payload: schemas.MilestoneUpdate, db: Session = Depends(get_db)):
    m = db.get(models.Milestone, milestone_id)
    if not m:
        raise HTTPException(404, "Milestone not found")
    data = payload.model_dump(exclude_unset=True)
    if data.get("status") == "done" and m.status != "done":
        m.completed_at = datetime.utcnow()
    for k, v in data.items():
        setattr(m, k, v)
    db.commit()
    db.refresh(m)
    return m


@router.delete("/milestones/{milestone_id}")
def delete_milestone(milestone_id: int, db: Session = Depends(get_db)):
    m = db.get(models.Milestone, milestone_id)
    if not m:
        raise HTTPException(404, "Milestone not found")
    db.delete(m)
    db.commit()
    return {"deleted": True}


# ==================== Publications ====================

@router.post("/publications", response_model=schemas.PublicationOut)
def create_publication(payload: schemas.PublicationCreate, db: Session = Depends(get_db)):
    if not db.get(models.Project, payload.project_id):
        raise HTTPException(404, "Project not found")
    p = models.Publication(**payload.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.get("/publications/{pub_id}", response_model=schemas.PublicationOut)
def get_publication(pub_id: int, db: Session = Depends(get_db)):
    p = db.get(models.Publication, pub_id)
    if not p:
        raise HTTPException(404, "Publication not found")
    return p


@router.delete("/publications/{pub_id}")
def delete_publication(pub_id: int, db: Session = Depends(get_db)):
    p = db.get(models.Publication, pub_id)
    if not p:
        raise HTTPException(404, "Publication not found")
    db.delete(p)
    db.commit()
    return {"deleted": True}


# ==================== Funding secured ====================

@router.post("/funding-secured", response_model=schemas.FundingSecuredOut)
def create_funding(payload: schemas.FundingSecuredCreate, db: Session = Depends(get_db)):
    if not db.get(models.Project, payload.project_id):
        raise HTTPException(404, "Project not found")
    f = models.FundingSecured(**payload.model_dump())
    db.add(f)
    db.commit()
    db.refresh(f)
    return f


@router.get("/funding-secured/{funding_id}", response_model=schemas.FundingSecuredOut)
def get_funding(funding_id: int, db: Session = Depends(get_db)):
    f = db.get(models.FundingSecured, funding_id)
    if not f:
        raise HTTPException(404, "Funding entry not found")
    return f


@router.delete("/funding-secured/{funding_id}")
def delete_funding(funding_id: int, db: Session = Depends(get_db)):
    f = db.get(models.FundingSecured, funding_id)
    if not f:
        raise HTTPException(404, "Funding entry not found")
    db.delete(f)
    db.commit()
    return {"deleted": True}