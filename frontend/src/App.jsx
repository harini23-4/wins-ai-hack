import React from 'react';
import { useEffect, useState } from "react";
import { getProfiles } from "./lib/api.js";
import ProfileOverview from "./components/ProfileOverview.jsx";
import CollaboratorMatches from "./components/CollaboratorMatches.jsx";
import FundingMatches from "./components/FundingMatches.jsx";
import ProjectTracker from "./components/ProjectTracker.jsx";
import ProfileForm from "./components/ProfileForm.jsx";

const ROLE_TABS = {
  researcher: [
    { id: "profile", label: "Profile" },
    { id: "collaborators", label: "Collaborator Matches" },
    { id: "funding", label: "Funding Matches" },
    { id: "projects", label: "Project Tracker" },
  ],
  collaborator: [
    { id: "collaborators", label: "Explore Collaborators" },
    { id: "profile", label: "Profile Details" },
    { id: "projects", label: "Joint Projects" },
  ],
  funder: [
    { id: "funding", label: "Grants & Opportunities" },
    { id: "collaborators", label: "Investigator Pool" },
    { id: "profile", label: "Sample Profile" },
  ],
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [role, setRole] = useState("researcher");
  const [tab, setTab] = useState("profile");

  useEffect(() => {
    getProfiles().then((all) => {
      const savedProfiles = localStorage.getItem("collabmatch_custom_profiles");
      const combined = savedProfiles ? [...all, ...JSON.parse(savedProfiles)] : all;
      setProfiles(combined);
      setActiveId(combined[0]?.id ?? null);
    });
  }, []);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setTab(ROLE_TABS[newRole][0].id);
    setEditing(false);
    setCreating(false);
  };

  const handleCreateProfile = (newProfile) => {
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    setActiveId(newProfile.id);
    setCreating(false);
    setEditing(false);
    setTab("profile");

    const custom = JSON.parse(localStorage.getItem("collabmatch_custom_profiles") || "[]");
    localStorage.setItem("collabmatch_custom_profiles", JSON.stringify([...custom, newProfile]));
  };

  const handleUpdateProfile = (updatedProfile) => {
    const updated = profiles.map((p) =>
      String(p.id) === String(updatedProfile.id) ? updatedProfile : p
    );
    setProfiles(updated);
    setEditing(false);
    setCreating(false);
    setTab("profile");

    // Persist edits to localStorage
    const custom = JSON.parse(localStorage.getItem("collabmatch_custom_profiles") || "[]");
    const existingIndex = custom.findIndex((p) => String(p.id) === String(updatedProfile.id));
    if (existingIndex >= 0) {
      custom[existingIndex] = updatedProfile;
      localStorage.setItem("collabmatch_custom_profiles", JSON.stringify(custom));
    } else {
      localStorage.setItem("collabmatch_custom_profiles", JSON.stringify([...custom, updatedProfile]));
    }
  };

  const profile = profiles.find((p) => String(p.id) === String(activeId));
  const currentTabs = ROLE_TABS[role] || ROLE_TABS.researcher;

  return (
    <div className={`app-shell ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
      {/* Sliding Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          CollabMatch
          <small>RESEARCH COLLABORATION ENGINE</small>
        </div>

        <nav>
          <div className="section-label" style={{ marginTop: 0, marginBottom: 12 }}>
            {role.toUpperCase()} NAVIGATION
          </div>
          {currentTabs.map((t) => (
            <button
              key={t.id}
              className={`nav-link ${tab === t.id && !creating && !editing ? "active" : ""}`}
              onClick={() => {
                setTab(t.id);
                setCreating(false);
                setEditing(false);
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* 1. EDIT BUTTON IN SIDEBAR */}
        {profile && (
          <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16 }}>
            <button
              type="button"
              className="nav-link"
              style={{ color: "var(--c-mint-lightest)", background: "rgba(255,255,255,0.08)", fontWeight: 600 }}
              onClick={() => {
                setEditing(true);
                setCreating(false);
              }}
            >
              ✏️ Edit Active Profile
            </button>
          </div>
        )}
      </aside>

      {/* Main Content & Top Header */}
      <div className="main-wrapper">
        <header className="top-header">
          <div className="header-left">
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarOpen ? "◧ Hide Menu" : "☰ Show Menu"}
            </button>

            <div className="perspective-container">
              <span className="perspective-label">Perspective:</span>
              <div className="role-badge-group">
                <button
                  type="button"
                  className={`role-btn ${role === "researcher" ? "active" : ""}`}
                  onClick={() => handleRoleChange("researcher")}
                >
                  🔬 Researcher
                </button>
                <button
                  type="button"
                  className={`role-btn ${role === "collaborator" ? "active" : ""}`}
                  onClick={() => handleRoleChange("collaborator")}
                >
                  🤝 Collaborator
                </button>
                <button
                  type="button"
                  className={`role-btn ${role === "funder" ? "active" : ""}`}
                  onClick={() => handleRoleChange("funder")}
                >
                  🏛️ Funding Org
                </button>
              </div>
            </div>
          </div>

          <div className="header-right">
            {profile && (
              <div className="profile-select-wrapper">
                <span>Viewing as:</span>
                <select
                  className="profile-dropdown"
                  value={activeId ?? ""}
                  onChange={(e) => {
                    setActiveId(e.target.value);
                    setCreating(false);
                    setEditing(false);
                  }}
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.institution})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 2. EDIT BUTTON IN TOP HEADER */}
            {profile && (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setEditing(true);
                  setCreating(false);
                }}
                style={{ fontWeight: 600 }}
              >
                ✏️ Edit Profile
              </button>
            )}

            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setCreating(true);
                setEditing(false);
              }}
            >
              + New Profile
            </button>
          </div>
        </header>

        <main className="main">
          {!profile && !creating && !editing && (
            <div className="loading">Loading research database...</div>
          )}

          {/* CREATE PROFILE FORM */}
          {creating && (
            <>
              <h1 className="page-title">Create Researcher Profile</h1>
              <p className="page-sub">
                Add a new researcher profile to calculate live collaborator scores and grant matches.
              </p>
              <ProfileForm
                onSave={handleCreateProfile}
                onCancel={() => setCreating(false)}
              />
            </>
          )}

          {/* EDIT PROFILE FORM */}
          {editing && profile && (
            <>
              <h1 className="page-title">Edit Researcher Profile</h1>
              <p className="page-sub">
                Update details for <strong>{profile.name}</strong>. Matching algorithms will recompute instantly.
              </p>
              <ProfileForm
                initialProfile={profile}
                onSave={handleUpdateProfile}
                onCancel={() => setEditing(false)}
              />
            </>
          )}

          {/* 3. RESEARCHER PROFILE VIEW WITH EDIT BUTTON */}
          {!creating && !editing && profile && tab === "profile" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                <div>
                  <h1 className="page-title">Researcher Profile</h1>
                  <p className="page-sub" style={{ marginBottom: 0 }}>
                    Switch profiles in the top right or click edit to update your research topics.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setEditing(true)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  ✏️ Edit Profile
                </button>
              </div>

              <ProfileOverview profile={profile} />

              <div className="card">
                <div className="section-label" style={{ marginTop: 0 }}>
                  Methodological & Domain Expertise
                </div>
                <div>
                  {profile.expertise?.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="section-label">Academic Details</div>
                <div className="meta-line">Career stage: {profile.careerStage}</div>
                <div className="meta-line">ORCID: {profile.orcid || "Not specified"}</div>
              </div>
            </>
          )}

          {!creating && !editing && profile && tab === "collaborators" && (
            <CollaboratorMatches profile={profile} />
          )}

          {!creating && !editing && profile && tab === "funding" && (
            <FundingMatches profile={profile} />
          )}

          {!creating && !editing && profile && tab === "projects" && (
            <ProjectTracker profile={profile} />
          )}
        </main>
      </div>
    </div>
  );
}