import { useEffect, useState } from "react";
import { getCollaboratorMatches, getProfiles } from "../lib/api.js";
import ScoreBar from "./ScoreBar.jsx";

// Availability & capacity generator for realistic researcher profiles
const getAvailabilityData = (profile) => {
  const options = [
    {
      status: "🟢 Actively Seeking Co-PIs",
      statusType: "active",
      hoursPerWeek: "8–12 hrs/week",
      preferredRoles: ["Grant Co-Principal Investigator", "Algorithm & Model Lead", "Joint Journal Publications"],
      targetGrants: ["NSF Cyber-Physical Systems (CPS)", "NIH R01 Healthcare AI", "DARPA Intelligent Systems"],
      responseTime: "Usually responds within 24 hours",
      timeZone: "EST (UTC-5) · Flexible for virtual syncs",
      currentLoad: "2 active grants · 1 PhD opening for joint projects",
      nextAvailableWindow: "Immediate for Fall 2026 grant cycle",
    },
    {
      status: "🔵 Open to Cross-Lab Collaboration",
      statusType: "open",
      hoursPerWeek: "5–8 hrs/week",
      preferredRoles: ["Domain Specialist / Co-Investigator", "Dataset & Benchmark Sharing", "Student Co-Mentorship"],
      targetGrants: ["NSF CISE Core Programs", "Sloan Research Fellowship", "Google Research Scholar Award"],
      responseTime: "Responds in 1–2 business days",
      timeZone: "PST (UTC-8) · Best for afternoon calls",
      currentLoad: "3 active projects · Open to 1 new proposal",
      nextAvailableWindow: "Next month (Q3/Q4 sprint)",
    },
    {
      status: "🟡 Selective (Proposal Sprints Only)",
      statusType: "selective",
      hoursPerWeek: "4–6 hrs/week",
      preferredRoles: ["Senior Advisory Co-PI", "Translational Clinical Lead", "Industry Consortium Member"],
      targetGrants: ["Department of Energy Early Career", "Schmidt Sciences AI", "Wellcome Leap Initiative"],
      responseTime: "Responds in 2–3 business days",
      timeZone: "CST (UTC-6) · Available for bi-weekly check-ins",
      currentLoad: "Heavy grant cycle · High impact projects only",
      nextAvailableWindow: "Winter 2026 grant deadlines",
    },
  ];

  const index = (profile.name?.length || 0) % options.length;
  return options[index];
};

// Organization database
const ORG_DETAILS = {
  "Rivertown University": {
    type: "Research University",
    location: "Rivertown, MA",
    focus: "Applied AI, Healthcare Informatics & Distributed Systems",
    grantSupport: "Over $45M in annual external research funding",
    description: "Leading private research institution with interdisciplinary centers in health informatics and trusted machine learning.",
  },
  "Northbridge Institute": {
    type: "Independent Research Institute",
    location: "Northbridge, CA",
    focus: "Genomics, Computational Biology & Bioethics",
    grantSupport: "Supported by NIH, NSF, and philanthropic endowments",
    description: "Specializes in high-throughput data science applied to biological discoveries and clinical trials.",
  },
  "Default": {
    type: "Academic & Research Institution",
    location: "United States",
    focus: "Interdisciplinary Scientific Research & Grant Development",
    grantSupport: "Active participant in federal and private research consortia",
    description: "Fosters cross-departmental collaborations and translational research initiatives.",
  }
};

export default function CollaboratorMatches({ profile }) {
  const [matches, setMatches] = useState(null);
  const [allProfiles, setAllProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("matches"); // 'matches' | 'all'
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    let alive = true;
    setMatches(null);

    if (profile) {
      getCollaboratorMatches(profile).then((res) => {
        if (alive) setMatches(res);
      });
    }

    getProfiles().then((res) => {
      if (alive) setAllProfiles(res);
    });

    return () => {
      alive = false;
    };
  }, [profile]);

  const lastName = profile?.name ? profile.name.split(" ").slice(-1)[0] : "";

  // Filter matches
  const filteredMatches = matches?.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.profile.name.toLowerCase().includes(q) ||
      m.profile.institution.toLowerCase().includes(q) ||
      m.profile.bio?.toLowerCase().includes(q) ||
      m.sharedInterests?.some((t) => t.toLowerCase().includes(q))
    );
  });

  // Filter all directory profiles
  const filteredAll = allProfiles
    .filter((p) => String(p.id) !== String(profile?.id))
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.institution.toLowerCase().includes(q) ||
        p.bio?.toLowerCase().includes(q) ||
        p.interests?.some((t) => t.toLowerCase().includes(q))
      );
    });

  const openOrgModal = (e, orgName) => {
    e.stopPropagation();
    const info = ORG_DETAILS[orgName] || { ...ORG_DETAILS.Default, name: orgName };
    setSelectedOrg({ name: orgName, ...info });
  };

  const handleSendInvite = (collaboratorName) => {
    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setSelectedCollaborator(null);
    }, 1800);
  };

  return (
    <div>
      {/* Header & Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Collaborator Network</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            {viewMode === "matches"
              ? `Ranked by research overlap relative to ${lastName}'s profile. Click any card to inspect availability & dossiers.`
              : "Explore all researchers in the network. Click any profile to view full capacity and availability."}
          </p>
        </div>

        {/* View Toggle */}
        <div style={{ display: "flex", background: "var(--c-mint-pale)", padding: 4, borderRadius: 8, border: "1px solid var(--border)" }}>
          <button
            type="button"
            className={`role-btn ${viewMode === "matches" ? "active" : ""}`}
            onClick={() => setViewMode("matches")}
          >
            ⚡ Ranked Matches
          </button>
          <button
            type="button"
            className={`role-btn ${viewMode === "all" ? "active" : ""}`}
            onClick={() => setViewMode("all")}
          >
            👥 All Collaborators ({allProfiles.length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Search collaborators by name, research topic, university, or availability..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "100%", background: "#ffffff" }}
        />
      </div>

      {/* MATCHES VIEW */}
      {viewMode === "matches" && (
        <>
          {matches === null && <div className="loading">Finding matches...</div>}
          {matches?.length === 0 && (
            <div className="empty">No strong matches in the current sample pool.</div>
          )}

          {filteredMatches?.map((m) => {
            const avail = getAvailabilityData(m.profile);
            return (
              <div
                className="card"
                key={m.profile.id}
                onClick={() => setSelectedCollaborator(m)}
                style={{ cursor: "pointer", transition: "all 0.2s ease" }}
              >
                <div className="match-row">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div className="name-line hover-underline">{m.profile.name}</div>
                      {/* Availability Tag */}
                      <span className="tag" style={{ background: "var(--c-mint-pale)", color: "var(--c-forest-deep)", fontWeight: 600, fontSize: "12px" }}>
                        {avail.status}
                      </span>
                      <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                        ⏱ {avail.hoursPerWeek}
                      </span>
                    </div>

                    <div className="meta-line">
                      {m.profile.title} ·{" "}
                      <button
                        type="button"
                        className="org-link-btn"
                        onClick={(e) => openOrgModal(e, m.profile.institution)}
                        title="View Institution Details"
                      >
                        🏛️ {m.profile.institution}
                      </button>
                      {m.sameInstitution && " · 🏫 same institution"}
                    </div>

                    {m.profile.bio && (
                      <p style={{ margin: "12px 0 10px 0", fontSize: "14.5px", color: "var(--text-primary)", lineHeight: "1.5" }}>
                        {m.profile.bio}
                      </p>
                    )}

                    <div style={{ marginTop: 10 }}>
                      {m.sharedInterests?.map((t) => (
                        <span key={t} className="tag shared" title="Shared research interest">
                          ★ {t}
                        </span>
                      ))}
                      {m.sharedExpertise?.map((t) => (
                        <span key={"e-" + t} className="tag">
                          {t}
                        </span>
                      ))}
                    </div>

                    <ScoreBar score={m.score} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                    <span className="score-badge">
                      {Math.round(m.score * 100)}% match
                    </span>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ fontSize: "13px", padding: "7px 14px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCollaborator(m);
                      }}
                    >
                      Inspect Dossier →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* DIRECTORY VIEW */}
      {viewMode === "all" && (
        <div>
          {filteredAll.map((p) => {
            const avail = getAvailabilityData(p);
            return (
              <div
                className="card"
                key={p.id}
                onClick={() => setSelectedCollaborator({ profile: p, score: 0.85, sharedInterests: p.interests, sharedExpertise: p.expertise })}
                style={{ cursor: "pointer" }}
              >
                <div className="match-row">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div className="name-line hover-underline">{p.name}</div>
                      <span className="tag" style={{ background: "var(--c-mint-pale)", color: "var(--c-forest-deep)", fontWeight: 600, fontSize: "12px" }}>
                        {avail.status}
                      </span>
                    </div>

                    <div className="meta-line">
                      {p.title} ·{" "}
                      <button
                        type="button"
                        className="org-link-btn"
                        onClick={(e) => openOrgModal(e, p.institution)}
                      >
                        🏛️ {p.institution}
                      </button>{" "}
                      ({p.department || "Faculty"})
                    </div>

                    {p.bio && (
                      <p style={{ margin: "12px 0 10px 0", fontSize: "14.5px", color: "var(--text-primary)", lineHeight: "1.5" }}>
                        {p.bio}
                      </p>
                    )}

                    <div style={{ marginTop: 10 }}>
                      {p.interests?.map((t) => (
                        <span key={t} className="tag shared">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                    <span className="tag" style={{ background: "var(--c-mint-pale)", borderColor: "var(--c-sage-medium)", color: "var(--c-forest-deep)", fontWeight: 600 }}>
                      {p.careerStage || "Researcher"}
                    </span>
                    <button type="button" className="btn-ghost" style={{ fontSize: "13px", padding: "6px 12px" }}>
                      View Availability →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COLLABORATOR DOSSIER & AVAILABILITY MODAL */}
      {selectedCollaborator && (
        <div className="modal-backdrop" onClick={() => setSelectedCollaborator(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <span className="tag" style={{ background: "var(--c-mint-pale)", color: "var(--c-forest-deep)", fontWeight: 700 }}>
                  COLLABORATOR PROFILE & AVAILABILITY
                </span>
                <h2 style={{ fontSize: 26, margin: "8px 0 4px 0", color: "var(--c-forest-deep)", fontFamily: "var(--font-serif)" }}>
                  {selectedCollaborator.profile.name}
                </h2>
                <div style={{ fontSize: 14.5, color: "var(--text-secondary)" }}>
                  {selectedCollaborator.profile.title} ·{" "}
                  <strong
                    style={{ color: "var(--c-forest-bright)", cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => {
                      const org = selectedCollaborator.profile.institution;
                      setSelectedCollaborator(null);
                      setSelectedOrg({ name: org, ...(ORG_DETAILS[org] || ORG_DETAILS.Default) });
                    }}
                  >
                    {selectedCollaborator.profile.institution}
                  </strong>
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setSelectedCollaborator(null)}
                style={{ borderRadius: "50%", width: 36, height: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            {/* LIVE AVAILABILITY CARD */}
            {(() => {
              const avail = getAvailabilityData(selectedCollaborator.profile);
              return (
                <div style={{ background: "var(--c-mint-lightest)", border: "1px solid var(--c-sage-medium)", borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--c-forest-bright)", textTransform: "uppercase" }}>
                        Current Status
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: "var(--c-forest-deep)", marginTop: 2 }}>
                        {avail.status}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Weekly Capacity</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--c-forest-deep)" }}>{avail.hoursPerWeek}</div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, borderTop: "1px solid var(--c-sage-light)", paddingTop: 12, fontSize: 13.5 }}>
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>🌍 Time Zone: </span>
                      <strong>{avail.timeZone}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>⚡ Response Time: </span>
                      <strong>{avail.responseTime}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>📅 Next Opening: </span>
                      <strong>{avail.nextAvailableWindow}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>📊 Current Load: </span>
                      <strong>{avail.currentLoad}</strong>
                    </div>
                  </div>

                  {/* Preferred Roles */}
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4 }}>
                      Preferred Collaboration Roles
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {avail.preferredRoles.map((role) => (
                        <span key={role} className="tag" style={{ background: "#ffffff", borderColor: "var(--c-sage-medium)", color: "var(--c-forest-deep)", fontSize: "12.5px" }}>
                          ✓ {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Target Grant Calls */}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4 }}>
                      Actively Preparing Proposals For
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {avail.targetGrants.map((grant) => (
                        <span key={grant} className="tag shared" style={{ fontSize: "12.5px" }}>
                          🏛️ {grant}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Research Statement & Bio */}
            <div style={{ marginBottom: 18 }}>
              <div className="section-label">Biography & Research Statement</div>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text-primary)", margin: "6px 0" }}>
                {selectedCollaborator.profile.bio || "Active faculty researcher focused on applied grants, student mentorship, and international publications."}
              </p>
            </div>

            {/* Domains & Expertise */}
            <div style={{ marginBottom: 18 }}>
              <div className="section-label">Key Research Domains & Skills</div>
              <div style={{ marginTop: 6 }}>
                {(selectedCollaborator.profile.interests || selectedCollaborator.sharedInterests || []).map((t) => (
                  <span key={t} className="tag shared">
                    ★ {t}
                  </span>
                ))}
                {(selectedCollaborator.profile.expertise || selectedCollaborator.sharedExpertise || []).map((t) => (
                  <span key={"modal-exp-" + t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Details */}
            <div style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border-card)", borderRadius: 8, padding: 14, marginBottom: 24 }}>
              <div style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 4 }}>
                <strong>Department:</strong> {selectedCollaborator.profile.department || "Computer Science & Engineering"}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 4 }}>
                <strong>Career Stage:</strong> {selectedCollaborator.profile.careerStage || "Mid-career"}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
                <strong>Verified ORCID:</strong> {selectedCollaborator.profile.orcid || "0000-0002-8419-291X"}
              </div>
            </div>

            {/* Invite feedback message */}
            {inviteSuccess && (
              <div style={{ background: "#d1fae5", border: "1px solid #10b981", color: "#065f46", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontWeight: 600, textAlign: "center" }}>
                ✓ Collaboration Request & Calendar Invite Sent Successfully!
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleSendInvite(selectedCollaborator.profile.name)}
              >
                📅 Request 1:1 Intro Call / Send Proposal Invite
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setSelectedCollaborator(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORGANIZATION MODAL */}
      {selectedOrg && (
        <div className="modal-backdrop" onClick={() => setSelectedOrg(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <span className="tag" style={{ background: "var(--c-mint-pale)", color: "var(--c-forest-deep)", fontWeight: 700 }}>
                  🏛️ INSTITUTION & GRANT PORTAL
                </span>
                <h2 style={{ fontSize: 26, margin: "8px 0 4px 0", color: "var(--c-forest-deep)", fontFamily: "var(--font-serif)" }}>
                  {selectedOrg.name}
                </h2>
                <div style={{ fontSize: 14.5, color: "var(--text-secondary)" }}>
                  {selectedOrg.type} · 📍 {selectedOrg.location}
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setSelectedOrg(null)}
                style={{ borderRadius: "50%", width: 36, height: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div className="section-label">Organization Overview</div>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text-primary)", margin: "6px 0" }}>
                {selectedOrg.description}
              </p>
            </div>

            <div style={{ background: "var(--c-mint-lightest)", border: "1px solid var(--c-sage-light)", borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, color: "var(--c-forest-deep)", marginBottom: 4, fontSize: 14.5 }}>
                Research & Funding Capacity
              </div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>
                <strong>Strategic Focus:</strong> {selectedOrg.focus}
              </div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                <strong>Grant Portfolio:</strong> {selectedOrg.grantSupport}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div className="section-label">Affiliated Faculty in this Network</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {allProfiles
                  .filter((p) => p.institution === selectedOrg.name)
                  .map((p) => (
                    <span
                      key={p.id}
                      className="tag"
                      style={{ cursor: "pointer", background: "var(--bg-card)", borderColor: "var(--c-forest-bright)", color: "var(--c-forest-deep)", fontWeight: 600 }}
                      onClick={() => {
                        setSelectedOrg(null);
                        setSelectedCollaborator({ profile: p, score: 0.9 });
                      }}
                    >
                      👤 {p.name} ({p.department || "Faculty"}) →
                    </span>
                  ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  alert(`Navigating to ${selectedOrg.name} portal!`);
                  setSelectedOrg(null);
                }}
              >
                🏛️ Explore Grant Calls
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setSelectedOrg(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}