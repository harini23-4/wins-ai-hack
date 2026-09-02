// ---------------------------------------------------------------------------
// Matching engine — pure functions, no React/DOM dependencies.
// Backend team can reimplement this same contract server-side later;
// the frontend only cares about the shapes returned here.
// ---------------------------------------------------------------------------

const norm = (s) => s.trim().toLowerCase();

/** Jaccard similarity between two tag arrays, 0..1 */
function jaccard(a = [], b = []) {
  const setA = new Set(a.map(norm));
  const setB = new Set(b.map(norm));
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const t of setA) if (setB.has(t)) intersection++;
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

function sharedTags(a = [], b = []) {
  const setB = new Set(b.map(norm));
  return a.filter((t) => setB.has(norm(t)));
}

/**
 * Score how well `candidate` complements `profile`.
 * Weighted blend: interests overlap (signals shared research direction)
 * + expertise overlap (signals actual skill complementarity)
 * + a same-institution nudge (real collaborations are easier locally).
 */
export function scoreCollaborator(profile, candidate) {
  const interestScore = jaccard(profile.interests, candidate.interests);
  const expertiseScore = jaccard(profile.expertise, candidate.expertise);
  const institutionBonus = profile.institution === candidate.institution ? 0.08 : 0;

  const score = interestScore * 0.55 + expertiseScore * 0.37 + institutionBonus;

  return {
    score: Math.min(1, score),
    sharedInterests: sharedTags(profile.interests, candidate.interests),
    sharedExpertise: sharedTags(profile.expertise, candidate.expertise),
    sameInstitution: institutionBonus > 0,
  };
}

export function findCollaborators(profile, allProfiles, { limit = 5, minScore = 0.05 } = {}) {
  return allProfiles
    .filter((c) => c.id !== profile.id)
    .map((candidate) => {
      const result = scoreCollaborator(profile, candidate);
      return { profile: candidate, ...result };
    })
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Score a grant against a profile: tag overlap with interests+expertise,
 * plus an eligibility gate on career stage (ineligible grants are still
 * returned but flagged, never silently hidden — a PI may want to see them
 * for a co-PI angle).
 */
export function scoreGrant(profile, grant) {
  const profileTags = [...profile.interests, ...profile.expertise];
  const overlapScore = jaccard(profileTags, grant.tags);
  const eligible = grant.careerStageEligibility.includes(profile.careerStage);

  return {
    score: overlapScore,
    matchedTags: sharedTags(grant.tags, profileTags),
    eligible,
  };
}

export function findGrants(profile, allGrants, { limit = 5, minScore = 0.05 } = {}) {
  const now = new Date();
  return allGrants
    .map((grant) => {
      const result = scoreGrant(profile, grant);
      const daysToDeadline = Math.ceil((new Date(grant.deadline) - now) / 86400000);
      return { grant, daysToDeadline, ...result };
    })
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}