from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, Date
from sqlalchemy.orm import relationship

from .database import Base


class Profile(Base):
    """A researcher's profile — the shared identity used by matching, funding, and tracker."""
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    department = Column(String(200))
    bio = Column(Text)
    interests = Column(Text)   # comma-separated tags, e.g. "nlp, computer vision, ethics"
    expertise = Column(Text)   # comma-separated tags, e.g. "python, pytorch, statistics"
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")

    def tag_set(self):
        raw = f"{self.interests or ''},{self.expertise or ''}"
        return {t.strip().lower() for t in raw.split(",") if t.strip()}


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    owner_profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text)
    status = Column(String(50), default="active")  # active | completed | paused
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("Profile", back_populates="projects")
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")
    publications = relationship("Publication", back_populates="project", cascade="all, delete-orphan")
    funding_entries = relationship("FundingSecured", back_populates="project", cascade="all, delete-orphan")


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text)
    due_date = Column(Date)
    status = Column(String(50), default="pending")  # pending | in_progress | done
    completed_at = Column(DateTime, nullable=True)

    project = relationship("Project", back_populates="milestones")


class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String(400), nullable=False)
    authors = Column(String(500))
    venue = Column(String(300))
    year = Column(Integer)
    link = Column(String(500))

    project = relationship("Project", back_populates="publications")


class FundingSecured(Base):
    __tablename__ = "funding_secured"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    source = Column(String(300), nullable=False)
    amount = Column(Float, default=0)
    date_secured = Column(Date)
    notes = Column(Text)

    project = relationship("Project", back_populates="funding_entries")


class Grant(Base):
    """Catalog of grants/funding opportunities used for recommendation matching."""
    __tablename__ = "grants"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    agency = Column(String(300))
    description = Column(Text)
    tags = Column(Text)  # comma-separated tags, matched against profile interests/expertise
    amount_max = Column(Float)
    deadline = Column(Date)
    link = Column(String(500))

    def tag_set(self):
        return {t.strip().lower() for t in (self.tags or "").split(",") if t.strip()}