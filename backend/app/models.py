# app/models.py
from sqlalchemy import Column, String, Integer, Text, ARRAY, DateTime, Date, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship
from pgvector.sqlalchemy import Vector
import uuid, datetime

Base = declarative_base()

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    institution = Column(String)
    career_stage = Column(String)
    interests = Column(ARRAY(String))
    expertise = Column(ARRAY(String))
    bio = Column(Text)
    embedding = Column(Vector(384))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Grant(Base):
    __tablename__ = "grants"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    funder = Column(String)
    description = Column(Text)
    eligible_career_stages = Column(ARRAY(String))
    keywords = Column(ARRAY(String))
    amount_min = Column(Integer)
    amount_max = Column(Integer)
    deadline = Column(DateTime)
    embedding = Column(Vector(384))


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_profile_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text)
    status = Column(String(50), default="active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("Profile")
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")
    publications = relationship("Publication", back_populates="project", cascade="all, delete-orphan")
    funding_entries = relationship("FundingSecured", back_populates="project", cascade="all, delete-orphan")


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text)
    due_date = Column(Date)
    status = Column(String(50), default="pending")
    completed_at = Column(DateTime, nullable=True)

    project = relationship("Project", back_populates="milestones")


class Publication(Base):
    __tablename__ = "publications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    title = Column(String(400), nullable=False)
    authors = Column(String(500))
    venue = Column(String(300))
    year = Column(Integer)
    link = Column(String(500))

    project = relationship("Project", back_populates="publications")


class FundingSecured(Base):
    __tablename__ = "funding_secured"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    source = Column(String(300), nullable=False)
    amount = Column(Float, default=0)
    date_secured = Column(Date)
    notes = Column(Text)

    project = relationship("Project", back_populates="funding_entries")