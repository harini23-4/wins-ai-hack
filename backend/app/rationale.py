# app/rationale.py
from app.models import Profile

def generate_match_rationale(profile: Profile, candidate: Profile, shared_interests: list[str]) -> str:
    # Case 1: direct shared interests — strongest, most convincing rationale
    if shared_interests:
        if len(shared_interests) == 1:
            return f"Both researchers share a focus on {shared_interests[0]}."
        return f"Both researchers share interests in {', '.join(shared_interests[:2])}."

    # Case 2: no shared interests, but complementary expertise (candidate has skills profile lacks)
    complementary = list(set(candidate.expertise) - set(profile.expertise))
    if complementary:
        skill = complementary[0]
        return f"{candidate.name} brings complementary expertise in {skill}, filling a gap in {profile.name}'s skill set."

    # Case 3: reverse complementary check (profile has skills candidate lacks)
    reverse_complementary = list(set(profile.expertise) - set(candidate.expertise))
    if reverse_complementary:
        skill = reverse_complementary[0]
        return f"{profile.name} could bring expertise in {skill} to complement {candidate.name}'s work."

    # Case 4: fallback — semantic similarity was high enough to match, but no obvious keyword overlap
    return f"Strong overall alignment in research focus based on profile similarity."