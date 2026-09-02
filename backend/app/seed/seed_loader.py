# app/seed/seed_loader.py
import json, sys, os
from datetime import datetime
sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))
from app.database import SessionLocal
from app.models import Profile, Grant
from app.embeddings import embed_text, profile_to_text, grant_to_text

def load():
    db = SessionLocal()

    with open("app/seed/seed_profiles.json") as f:
        for p in json.load(f):
            profile = Profile(**p)
            profile.embedding = embed_text(profile_to_text(profile))
            db.add(profile)

    with open("app/seed/seed_grants.json") as f:
        for g in json.load(f):
            g["deadline"] = datetime.fromisoformat(g["deadline"])  # string -> datetime
            grant = Grant(**g)
            grant.embedding = embed_text(grant_to_text(grant))
            db.add(grant)

    db.commit()
    print(f"Seed data loaded: profiles and grants inserted.")

if __name__ == "__main__":
    load()