# app/schemas.py
from pydantic import BaseModel, field_validator
from typing import List, Optional
from uuid import UUID
import datetime
from datetime import date, datetime as dt

class ProfileCreate(BaseModel):
    name: str
    institution: Optional[str] = None
    career_stage: Optional[str] = None
    interests: List[str] = []
    expertise: List[str] = []
    bio: Optional[str] = ""
    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, v):
        if not v or not v.strip():
            raise ValueError("name cannot be empty")
        return v.strip()

    @field_validator("interests", "expertise")
    @classmethod
    def strip_empty_entries(cls, v):
        # removes accidental empty strings like ["", "NLP", ""]
        return [item.strip() for item in v if item and item.strip()]

class ProfileOut(BaseModel):
    id: UUID
    name: str
    institution: Optional[str]
    career_stage: Optional[str]
    interests: List[str]
    expertise: List[str]
    bio: Optional[str]

    class Config:
        from_attributes = True

class CollaboratorMatch(BaseModel):
    id: str
    name: str
    score: float
    shared_interests: List[str]

class FundingMatch(BaseModel):
    id: str
    title: str
    funder: Optional[str]
    score: float

class MatchResponse(BaseModel):
    profile_id: str
    collaborators: List[CollaboratorMatch]
    funding: List[FundingMatch]
# app/schemas.py — ADD these below your existing Profile/Match schemas
from datetime import date, datetime as dt

class MilestoneCreate(BaseModel):
    project_id: UUID
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[str] = "pending"

class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[str] = None

class MilestoneOut(BaseModel):
    id: UUID
    project_id: UUID
    title: str
    description: Optional[str]
    due_date: Optional[date]
    status: str
    completed_at: Optional[dt]

    class Config:
        from_attributes = True

class PublicationCreate(BaseModel):
    project_id: UUID
    title: str
    authors: Optional[str] = None
    venue: Optional[str] = None
    year: Optional[int] = None
    link: Optional[str] = None

class PublicationOut(BaseModel):
    id: UUID
    project_id: UUID
    title: str
    authors: Optional[str]
    venue: Optional[str]
    year: Optional[int]
    link: Optional[str]

    class Config:
        from_attributes = True

class FundingSecuredCreate(BaseModel):
    project_id: UUID
    source: str
    amount: Optional[float] = 0
    date_secured: Optional[date] = None
    notes: Optional[str] = None

class FundingSecuredOut(BaseModel):
    id: UUID
    project_id: UUID
    source: str
    amount: Optional[float]
    date_secured: Optional[date]
    notes: Optional[str]

    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    owner_profile_id: UUID
    title: str
    description: Optional[str] = None
    status: Optional[str] = "active"

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class ProjectOut(BaseModel):
    id: UUID
    owner_profile_id: UUID
    title: str
    description: Optional[str]
    status: str
    created_at: dt

    class Config:
        from_attributes = True

class ProjectSummary(BaseModel):
    project: ProjectOut
    milestones: List[MilestoneOut]
    publications: List[PublicationOut]
    funding_secured: List[FundingSecuredOut]
    total_funding: float
    milestone_progress: float

    class Config:
        from_attributes = True