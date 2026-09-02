// ---------------------------------------------------------------------------
// Single integration seam. Every component calls THESE functions only —
// never fetch() and never import the JSON files directly outside this file.
// That means swapping mock data for a real backend later is a one-line
// change (USE_MOCK = false) and zero component edits, as long as whoever
// builds the backend returns the same shapes documented below.
// ---------------------------------------------------------------------------
import profiles from "../data/profiles.json";
import grants from "../data/grants.json";
import projects from "../data/projects.json";
import { findCollaborators, findGrants } from "./matching.js";

const USE_MOCK = true; // <- flip to false once the real API is ready
const BASE_URL = "/api"; // proxied to the backend in vite.config.js

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function realFetch(path, opts) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`);
  return res.json();
}

/** GET /api/profiles -> Profile[] */
export async function getProfiles() {
  if (USE_MOCK) {
    await delay(150);
    return profiles;
  }
  return realFetch("/profiles");
}

/** GET /api/profiles/:id -> Profile */
export async function getProfile(id) {
  if (USE_MOCK) {
    await delay(100);
    const found = profiles.find((p) => p.id === id);
    if (!found) throw new Error(`Profile ${id} not found`);
    return found;
  }
  return realFetch(`/profiles/${id}`);
}

/**
 * POST /api/match/collaborators { profile } -> MatchResult[]
 * MatchResult: { profile: Profile, score: 0..1, sharedInterests: string[],
 *                sharedExpertise: string[], sameInstitution: boolean }
 */
export async function getCollaboratorMatches(profile) {
  if (USE_MOCK) {
    await delay(300);
    return findCollaborators(profile, profiles);
  }
  return realFetch("/match/collaborators", {
    method: "POST",
    body: JSON.stringify({ profile }),
  });
}

/**
 * POST /api/match/funding { profile } -> GrantMatch[]
 * GrantMatch: { grant: Grant, score: 0..1, matchedTags: string[],
 *               eligible: boolean, daysToDeadline: number }
 */
export async function getFundingMatches(profile) {
  if (USE_MOCK) {
    await delay(300);
    return findGrants(profile, grants);
  }
  return realFetch("/match/funding", {
    method: "POST",
    body: JSON.stringify({ profile }),
  });
}

/** GET /api/projects?ownerId= -> Project[] */
export async function getProjects(ownerId) {
  if (USE_MOCK) {
    await delay(150);
    return projects.filter((p) => p.ownerId === ownerId || p.collaborators.includes(ownerId));
  }
  return realFetch(`/projects?ownerId=${ownerId}`);
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
  return realFetch(`/projects/${projectId}/milestones/${milestoneId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}