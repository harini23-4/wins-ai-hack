# app/embeddings.py
from sentence_transformers import SentenceTransformer

_model = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

def embed_text(text: str) -> list[float]:
    if not text or not text.strip():
        text = "general researcher with unspecified interests"  # safe fallback, never embed empty string
    model = get_model()
    return model.encode(text, normalize_embeddings=True).tolist()

def profile_to_text(profile) -> str:
    interests = ', '.join(profile.interests) if profile.interests else "not specified"
    expertise = ', '.join(profile.expertise) if profile.expertise else "not specified"
    bio = profile.bio if profile.bio else ""
    return f"Interests: {interests}. Expertise: {expertise}. Bio: {bio}"

def grant_to_text(grant) -> str:
    keywords = ', '.join(grant.keywords) if grant.keywords else "not specified"
    description = grant.description if grant.description else ""
    return f"{grant.title}. {description}. Keywords: {keywords}"