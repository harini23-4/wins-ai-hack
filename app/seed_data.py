"""
Populate the DB with sample profiles, grants, and one demo project.
Run with:  python -m app.seed_data
"""
from datetime import date

from .database import SessionLocal, engine, Base
from . import models

Base.metadata.create_all(bind=engine)


def run():
    db = SessionLocal()
    try:
        if db.query(models.Profile).first():
            print("Data already seeded — skipping. (Delete dev.db to reseed.)")
            return

        profiles = [
            models.Profile(
                name="Dr. Ananya Rao", email="ananya.rao@univ.edu", department="Computer Science",
                bio="Works on NLP and low-resource languages.",
                interests="nlp, low-resource languages, ethics",
                expertise="python, transformers, linguistics",
            ),
            models.Profile(
                name="Dr. Rahul Mehta", email="rahul.mehta@univ.edu", department="Computer Science",
                bio="Computer vision and robotics researcher.",
                interests="computer vision, robotics, embedded systems",
                expertise="python, pytorch, c++",
            ),
            models.Profile(
                name="Dr. Sara Iyer", email="sara.iyer@univ.edu", department="Public Health",
                bio="Applies ML to epidemiology and public health policy.",
                interests="epidemiology, public health, ml for social good",
                expertise="statistics, r, python",
            ),
            models.Profile(
                name="Dr. Vikram Nair", email="vikram.nair@univ.edu", department="Computer Science",
                bio="NLP researcher focused on ethics and fairness.",
                interests="nlp, ethics, fairness in ai",
                expertise="python, transformers, causal inference",
            ),
            models.Profile(
                name="Dr. Priya Das", email="priya.das@univ.edu", department="Electrical Engineering",
                bio="Robotics and embedded ML systems.",
                interests="robotics, embedded systems, computer vision",
                expertise="c++, embedded ml, control systems",
            ),
        ]
        db.add_all(profiles)
        db.commit()
        for p in profiles:
            db.refresh(p)

        grants = [
            models.Grant(
                title="AI for Social Good Grant", agency="National Science Foundation",
                description="Funding for ML applications addressing societal challenges.",
                tags="ml for social good, public health, ethics, fairness in ai",
                amount_max=50000, deadline=date(2026, 12, 1),
                link="https://example.org/nsf-social-good",
            ),
            models.Grant(
                title="NLP for Low-Resource Languages Award", agency="Google Research",
                description="Supports research extending NLP to underrepresented languages.",
                tags="nlp, low-resource languages, linguistics",
                amount_max=30000, deadline=date(2026, 11, 15),
                link="https://example.org/google-nlp",
            ),
            models.Grant(
                title="Robotics Innovation Fund", agency="DARPA",
                description="Funding for advances in autonomous robotics and embedded systems.",
                tags="robotics, embedded systems, control systems, computer vision",
                amount_max=100000, deadline=date(2027, 1, 20),
                link="https://example.org/darpa-robotics",
            ),
            models.Grant(
                title="Responsible AI Research Grant", agency="Mozilla Foundation",
                description="Supports research on fairness, transparency and ethics in AI systems.",
                tags="ethics, fairness in ai, nlp",
                amount_max=25000, deadline=date(2026, 10, 30),
                link="https://example.org/mozilla-ai",
            ),
        ]
        db.add_all(grants)
        db.commit()

        project = models.Project(
            owner_profile_id=profiles[0].id,
            title="Low-Resource Language Translation",
            description="Building translation models for under-resourced Indian languages.",
            status="active",
        )
        db.add(project)
        db.commit()
        db.refresh(project)

        db.add_all([
            models.Milestone(project_id=project.id, title="Collect parallel corpus",
                              status="done", due_date=date(2026, 6, 1)),
            models.Milestone(project_id=project.id, title="Train baseline model",
                              status="in_progress", due_date=date(2026, 9, 15)),
            models.Milestone(project_id=project.id, title="Human evaluation study",
                              status="pending", due_date=date(2026, 11, 1)),
        ])
        db.add(models.Publication(
            project_id=project.id, title="Low-Resource NMT: A Survey",
            authors="Rao, A.", venue="ACL Workshop", year=2025,
            link="https://example.org/paper1",
        ))
        db.add(models.FundingSecured(
            project_id=project.id, source="University Seed Grant",
            amount=5000, date_secured=date(2026, 3, 1), notes="Initial seed funding.",
        ))
        db.commit()
        print(f"Seeded {len(profiles)} profiles, {len(grants)} grants, 1 demo project.")
    finally:
        db.close()


if __name__ == "__main__":
    run()