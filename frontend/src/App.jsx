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
  };

  const handleCreateProfile = (newProfile) => {
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    setActiveId(newProfile.id);
    setCreating(false);
    setTab("profile");

    const custom = JSON.parse(localStorage.getItem("collabmatch_custom_profiles") || "[]");
    localStorage.setItem("collabmatch_custom_profiles", JSON.stringify([...custom, newProfile]));
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
              className={`nav-link ${tab === t.id ? "active" : ""}`}
              onClick={() => {
                setTab(t.id);
                setCreating(false);
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content & Spaced Top Header */}
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

            <button
              type="button"
              className="btn-primary"
              onClick={() => setCreating(true)}
            >
              + New Profile
            </button>
          </div>
        </header>

        <main className="main">
          {!profile && !creating && (
            <div className="loading">Loading research database...</div>
          )}

          {creating && (
            <>
              <h1 className="page-title">Create Researcher Profile</h1>
              <p className="page-sub">
                Add your profile to compute live AI collaborator scores and grant matches immediately.
              </p>
              <ProfileForm
                onCreate={handleCreateProfile}
                onCancel={() => setCreating(false)}
              />
            </>
          )}

          {!creating && profile && tab === "profile" && (
            <>
              <h1 className="page-title">Researcher Profile</h1>
              <p className="page-sub">
                Switch profiles in the top right to explore matching scores from different perspectives.
              </p>
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

          {!creating && profile && tab === "collaborators" && (
            <CollaboratorMatches profile={profile} />
          )}

          {!creating && profile && tab === "funding" && (
            <FundingMatches profile={profile} />
          )}

          {!creating && profile && tab === "projects" && (
            <ProjectTracker profile={profile} />
          )}
        </main>
      </div>
    </div>
  );
}