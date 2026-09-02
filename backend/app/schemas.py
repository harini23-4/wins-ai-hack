# app/schemas.py
from pydantic import BaseModel, field_validator
from typing import List, Optional
from uuid import UUID
import datetime

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