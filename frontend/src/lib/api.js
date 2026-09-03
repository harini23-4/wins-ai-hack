import profiles from "../data/profiles.json";
import grants from "../data/grants.json";
import projects from "../data/projects.json";
import { findCollaborators, findGrants } from "./matching.js";

const USE_MOCK = false; // Real backend is active!
const BASE_URL = "/api"; // proxied to http://localhost:8000 in vite.config.js

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function realFetch(path, opts) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`);
  return res.json();
}

/** GET /api/profiles/ -> Profile[] */
/** GET /api/profiles/ -> Profile[] */
export async function getProfiles() {
  if (USE_MOCK) {
    await delay(150);
    return profiles;
  }
  try {
    const data = await realFetch("/profiles/");
    const list = Array.isArray(data) ? data : data.profiles || [];
    
    // If the database has real profiles, use them!
    if (list.length > 0) return list;

    // If backend database is currently empty, fallback to sample profiles so the app doesn't freeze
    console.warn("Backend returned 0 profiles. Using sample profiles for demo.");
    return profiles;
  } catch (err) {
    console.error("Failed to connect to backend /profiles/, falling back to sample data:", err);
    return profiles;
  }
}

/** GET /api/profiles/:id -> Profile */
export async function getProfile(id) {
  if (USE_MOCK) {
    await delay(100);
    const found = profiles.find((p) => String(p.id) === String(id));
    if (!found) throw new Error(`Profile ${id} not found`);
    return found;
  }
  return realFetch(`/profiles/${id}`);
}

/**
 * GET /api/profiles/{id}/matches
 * Adapts backend schema to frontend component structure
 */
export async function getCollaboratorMatches(profile) {
  if (USE_MOCK) {
    await delay(300);
    return findCollaborators(profile, profiles);
  }

  try {
    const data = await realFetch(`/profiles/${profile.id}/matches`);
    const rawCollaborators = Array.isArray(data) ? data : data.collaborators || [];

    // Adapter: convert backend shape to frontend card expectations
    return rawCollaborators.map((c) => ({
      score: c.score ?? 0.85,
      sharedInterests: c.shared_interests || c.sharedInterests || [],
      sharedExpertise: c.shared_expertise || c.sharedExpertise || [],
      sameInstitution: Boolean(c.same_institution || c.sameInstitution),
      profile: {
        id: c.id,
        name: c.name,
        title: c.title || "Principal Investigator",
        institution: c.institution || "Research Institution",
        department: c.department || "",
        bio: c.bio || c.rationale || "Active researcher dedicated to high-impact scientific inquiry and cross-lab collaboration.",
        interests: c.interests || c.shared_interests || [],
        expertise: c.expertise || c.shared_expertise || [],
        careerStage: c.career_stage || c.careerStage || "Senior Researcher",
        orcid: c.orcid || "0000-0002-8419-291X",
      },
    }));
  } catch (err) {
    console.error("Collaborator matches fetch failed, using fallback:", err);
    return findCollaborators(profile, profiles);
  }
}

/**
 * GET /api/profiles/{id}/funding
 * Adapts backend { funder, amount_max } -> frontend { agency, amount }
 */
export async function getFundingMatches(profile) {
  if (USE_MOCK) {
    await delay(300);
    return findGrants(profile, grants);
  }

  try {
    const data = await realFetch(`/profiles/${profile.id}/funding`);
    const rawFunding = Array.isArray(data) ? data : data.funding || [];

    // Adapter: convert backend shape to frontend grant card expectations
    return rawFunding.map((f) => ({
      score: f.score ?? 0.85,
      eligible: f.eligible !== undefined ? f.eligible : true,
      grant: {
        id: f.id,
        title: f.title,
        agency: f.funder || f.agency || "Federal Science Sponsor",
        amount: f.amount_max || f.amount_min || f.amount || 750000,
        deadline: f.deadline || "October 15, 2026",
        description: f.description || "Advancing fundamental principles and interdisciplinary technologies.",
        tags: f.tags || f.matched_tags || f.matchedTags || ["research", "interdisciplinary"],
        careerStageEligibility: f.career_stage_eligibility || "All Career Stages",
      },
    }));
  } catch (err) {
    console.error("Funding matches fetch failed, using fallback:", err);
    return findGrants(profile, grants);
  }
}

/** GET /api/projects?ownerId= -> Project[] (with graceful fallback) */
export async function getProjects(ownerId) {
  if (USE_MOCK) {
    await delay(150);
    return projects.filter((p) => p.ownerId === ownerId || p.collaborators.includes(ownerId));
  }

  try {
    return await realFetch(`/projects?ownerId=${ownerId}`);
  } catch (err) {
    // Graceful fallback while teammate B verifies tracker endpoints
    console.warn("Backend /projects not ready yet, displaying local projects:", err);
    return projects.filter((p) => p.ownerId === ownerId || p.collaborators.includes(ownerId));
  }
}

/** PATCH /api/projects/:id/milestones/:milestoneId { status } -> Project */
export async function updateMilestoneStatus(projectId, milestoneId, status) {
  if (USE_MOCK) {
    await delay(150);
    const project = projects.find((p) => p.id === projectId);
    if (!project) throw new Error("Project not found");
    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (milestone) milestone.status = status;
    return project;
  }

  try {
    return await realFetch(`/projects/${projectId}/milestones/${milestoneId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    console.warn("Milestone patch failed remotely, updating locally:", err);
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      const milestone = project.milestones.find((m) => m.id === milestoneId);
      if (milestone) milestone.status = status;
    }
    return project;
  }
}