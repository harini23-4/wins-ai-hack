# app/models.py
from sqlalchemy import Column, String, Integer, Text, ARRAY, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from pgvector.sqlalchemy import Vector
from sqlalchemy.orm import declarative_base
import uuid, datetime

Base = declarative_base()

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    institution = Column(String)
    career_stage = Column(String)          # "PhD", "PostDoc", "Faculty", etc.
    interests = Column(ARRAY(String))       # ["NLP", "interpretability"]
    expertise = Column(ARRAY(String))       # skills/tools
    bio = Column(Text)
    embedding = Column(Vector(384))         # matches MiniLM-L6-v2 output dim
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