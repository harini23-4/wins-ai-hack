from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict


# ---------------- Profile ----------------

class ProfileBase(BaseModel):
    name: str
    email: EmailStr
    department: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[str] = ""   # "nlp, computer vision, ethics"
    expertise: Optional[str] = ""   # "python, pytorch, statistics"


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[str] = None
    expertise: Optional[str] = None


class ProfileOut(ProfileBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class CollaboratorMatch(BaseModel):
    profile: ProfileOut
    score: float
    shared_tags: List[str]


class GrantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    agency: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None
    amount_max: Optional[float] = None
    deadline: Optional[date] = None
    link: Optional[str] = None


class FundingMatch(BaseModel):
    grant: GrantOut
    score: float
    matched_tags: List[str]


# ---------------- Tracker: Projects ----------------

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "active"


class ProjectCreate(ProjectBase):
    owner_profile_id: int


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class ProjectOut(ProjectBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    owner_profile_id: int
    created_at: datetime


# ---------------- Tracker: Milestones ----------------

class MilestoneBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[str] = "pending"


class MilestoneCreate(MilestoneBase):
    project_id: int


class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[str] = None


class MilestoneOut(MilestoneBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    project_id: int
    completed_at: Optional[datetime] = None


# ---------------- Tracker: Publications ----------------

class PublicationBase(BaseModel):
    title: str
    authors: Optional[str] = None
    venue: Optional[str] = None
    year: Optional[int] = None
    link: Optional[str] = None


class PublicationCreate(PublicationBase):
    project_id: int


class PublicationOut(PublicationBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    project_id: int


# ---------------- Tracker: Funding secured ----------------

class FundingSecuredBase(BaseModel):
    source: str
    amount: Optional[float] = 0
    date_secured: Optional[date] = None
    notes: Optional[str] = None


class FundingSecuredCreate(FundingSecuredBase):
    project_id: int


class FundingSecuredOut(FundingSecuredBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    project_id: int


class ProjectSummary(BaseModel):
    project: ProjectOut
    milestones: List[MilestoneOut]
    publications: List[PublicationOut]
    funding_secured: List[FundingSecuredOut]
    total_funding: float
    milestone_progress: float  # percent complete, 0-100