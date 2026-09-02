import { useEffect, useState } from "react";
import { getCollaboratorMatches, getProfiles } from "../lib/api.js";
import ScoreBar from "./ScoreBar.jsx";

// Availability information helper
const getAvailabilityData = (profile) => {
  const options = [
    {
      status: "🟢 Actively Seeking Co-PIs & Collaborators",
      hoursPerWeek: "8–12 hrs/week",
      preferredRoles: ["Grant Co-Principal Investigator", "Algorithm & Technical Lead", "Joint Journal Publications"],
      targetGrants: ["NSF Cyber-Physical Systems (CPS)", "NIH R01 Healthcare AI", "DARPA Intelligent Systems"],
      responseTime: "Usually responds within 24 hours",
      timeZone: "EST (UTC-5) · Flexible for virtual syncs",
      currentLoad: "2 active grants · 1 opening for joint projects",
      nextAvailableWindow: "Immediate for Fall 2026 grant cycle",
    },
    {
      status: "🔵 Open to Cross-Lab Collaboration",
      hoursPerWeek: "5–8 hrs/week",
      preferredRoles: ["Domain Specialist / Co-Investigator", "Dataset & Benchmark Sharing", "Student Co-Mentorship"],
      targetGrants: ["NSF CISE Core Programs", "Sloan Research Fellowship", "Google Research Scholar Award"],
      responseTime: "Responds in 1–2 business days",
      timeZone: "PST (UTC-8) · Best for afternoon calls",
      currentLoad: "3 active projects · Open to 1 new proposal",
      nextAvailableWindow: "Next month (Q3/Q4 sprint)",
    },
    {
      status: "🟡 Selective (High-Impact Grants Only)",
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
  const [inviteSent, setInviteSent] = useState(false);

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

  // 1. DEDICATED COLLABORATOR DETAILS PAGE
  if (selectedCollaborator) {
    const p = selectedCollaborator.profile;
    const avail = getAvailabilityData(p);
    const score = selectedCollaborator.score;

    return (
      <div>
        <button
          type="button"
          className="btn-ghost"
          style={{ marginBottom: 20, display: "inline-flex", alignItems: "center", gap: 6 }}
          onClick={() => {
            setSelectedCollaborator(null);
            setInviteSent(false);
          }}
        >
          ← Back to Collaborator Matches
        </button>

        <div className="card" style={{ padding: "30px 34px" }}>
          {/* Top Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <span className="tag" style={{ background: "var(--c-mint-pale)", color: "var(--c-forest-deep)", fontWeight: 700 }}>
                RESEARCHER PROFILE & AVAILABILITY
              </span>
              <h1 className="page-title" style={{ margin: "10px 0 4px 0", fontSize: 30 }}>
                {p.name}
              </h1>
              <div style={{ fontSize: 16, color: "var(--text-secondary)" }}>
                {p.title} ·{" "}
                <strong
                  style={{ color: "var(--c-forest-bright)", cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => {
                    setSelectedOrg({ name: p.institution, ...(ORG_DETAILS[p.institution] || ORG_DETAILS.Default) });
                    setSelectedCollaborator(null);
                  }}
                >
                  🏛️ {p.institution}
                </strong>
                {p.department && ` (${p.department})`}
              </div>
            </div>

            {score && (
              <div style={{ textAlign: "right" }}>
                <span className="score-badge" style={{ fontSize: 16, padding: "6px 16px" }}>
                  {Math.round(score * 100)}% Match
                </span>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 4 }}>
                  Calculated by research overlap
                </div>
              </div>
            )}
          </div>

          <hr style={{ borderColor: "var(--border)", margin: "24px 0" }} />

          {/* AVAILABILITY & BANDWIDTH SECTION */}
          <div style={{ background: "var(--c-mint-lightest)", border: "1px solid var(--c-sage-medium)", borderRadius: 12, padding: "22px", marginBottom: 26 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--c-forest-bright)", textTransform: "uppercase" }}>
                  Current Availability Status
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--c-forest-deep)", marginTop: 2 }}>
                  {avail.status}
                </div>
              </div>
              <div>
                <span className="tag" style={{ background: "#ffffff", borderColor: "var(--c-sage-dark)", fontSize: "14px", fontWeight: 700, color: "var(--c-forest-deep)", padding: "6px 14px" }}>
                  ⏱ Capacity: {avail.hoursPerWeek}
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, borderTop: "1px solid var(--c-sage-light)", paddingTop: 14, fontSize: 14.5 }}>
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

            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 6 }}>
                Open To These Collaboration Roles
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {avail.preferredRoles.map((role) => (
                  <span key={role} className="tag" style={{ background: "#ffffff", borderColor: "var(--c-sage-medium)", color: "var(--c-forest-deep)", fontSize: "13px" }}>
                    ✓ {role}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 6 }}>
                Targeting These Upcoming Grants
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {avail.targetGrants.map((grant) => (
                  <span key={grant} className="tag shared" style={{ fontSize: "13px" }}>
                    🏛️ {grant}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* BIO & RESEARCH STATEMENT */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-label">Biography & Research Statement</div>
            <p style={{ fontSize: 15.5, lineHeight: 1.65, color: "var(--text-primary)", margin: "8px 0" }}>
              {p.bio || "Active researcher dedicated to high-impact scientific inquiry, open-source computational tools, and multi-institutional collaborations."}
            </p>
          </div>

          {/* RESEARCH INTERESTS & EXPERTISE */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-label">Research Interests</div>
            <div style={{ marginTop: 6 }}>
              {(p.interests || selectedCollaborator.sharedInterests || []).map((t) => (
                <span key={t} className="tag shared" style={{ fontSize: 13.5, padding: "5px 14px" }}>
                  ★ {t}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div className="section-label">Methodological Expertise</div>
            <div style={{ marginTop: 6 }}>
              {(p.expertise || selectedCollaborator.sharedExpertise || []).map((t) => (
                <span key={"exp-" + t} className="tag" style={{ fontSize: 13.5, padding: "5px 14px" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ACADEMIC DETAILS */}
          <div style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border-card)", borderRadius: 10, padding: 18, marginBottom: 28 }}>
            <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 6 }}>
              <strong>Career Stage:</strong> {p.careerStage || "Senior Researcher"}
            </div>
            <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              <strong>Verified ORCID:</strong> {p.orcid || "0000-0002-8419-291X"}
            </div>
          </div>

          {/* SUCCESS MESSAGE */}
          {inviteSent && (
            <div style={{ background: "#d1fae5", border: "1px solid #10b981", color: "#065f46", padding: "12px 18px", borderRadius: 8, marginBottom: 20, fontWeight: 600 }}>
              ✓ Collaboration invitation and intro message sent to {p.name}!
            </div>
          )}

          {/* ACTIONS */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setInviteSent(true)}
            >
              ✉ Send Collaboration Invitation
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setSelectedCollaborator(null);
                setInviteSent(false);
              }}
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. DEDICATED ORGANIZATION DETAILS PAGE
  if (selectedOrg) {
    return (
      <div>
        <button
          type="button"
          className="btn-ghost"
          style={{ marginBottom: 20, display: "inline-flex", alignItems: "center", gap: 6 }}
          onClick={() => setSelectedOrg(null)}
        >
          ← Back to Collaborators
        </button>

        <div className="card" style={{ padding: "30px 34px" }}>
          <span className="tag" style={{ background: "var(--c-mint-pale)", color: "var(--c-forest-deep)", fontWeight: 700 }}>
            INSTITUTION & RESEARCH PORTAL
          </span>
          <h1 className="page-title" style={{ margin: "10px 0 4px 0", fontSize: 30 }}>
            {selectedOrg.name}
          </h1>
          <div style={{ fontSize: 15.5, color: "var(--text-secondary)", marginBottom: 20 }}>
            {selectedOrg.type} · 📍 {selectedOrg.location}
          </div>

          <div style={{ marginBottom: 24 }}>
            <div className="section-label">Overview</div>
            <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "var(--text-primary)", margin: "8px 0" }}>
              {selectedOrg.description}
            </p>
          </div>

          <div style={{ background: "var(--c-mint-lightest)", border: "1px solid var(--c-sage-medium)", borderRadius: 10, padding: 18, marginBottom: 24 }}>
            <div style={{ fontWeight: 700, color: "var(--c-forest-deep)", marginBottom: 6, fontSize: 15 }}>
              Research & Funding Portfolio
            </div>
            <div style={{ fontSize: 14.5, color: "var(--text-secondary)", marginBottom: 6 }}>
              <strong>Strategic Priorities:</strong> {selectedOrg.focus}
            </div>
            <div style={{ fontSize: 14.5, color: "var(--text-secondary)" }}>
              <strong>Annual Research Grants:</strong> {selectedOrg.grantSupport}
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div className="section-label">Affiliated Faculty in Network</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
              {allProfiles
                .filter((p) => p.institution === selectedOrg.name)
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="btn-ghost"
                    style={{ fontSize: "14px", padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
                    onClick={() => {
                      setSelectedOrg(null);
                      setSelectedCollaborator({ profile: p, score: 0.9 });
                    }}
                  >
                    👤 {p.name} ({p.department || "Faculty"}) →
                  </button>
                ))}
            </div>
          </div>

          <button
            type="button"
            className="btn-ghost"
            onClick={() => setSelectedOrg(null)}
          >
            ← Back to Collaborator Matches
          </button>
        </div>
      </div>
    );
  }

  // 3. MAIN COLLABORATOR MATCHES LIST VIEW
  const filteredMatches = matches?.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.profile.name.toLowerCase().includes(q) ||
      m.profile.institution.toLowerCase().includes(q) ||
      m.profile.bio?.toLowerCase().includes(q) ||
      m.sharedInterests?.some((t) => t.toLowerCase().includes(q))
    );
  });

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

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Collaborator Network</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            {viewMode === "matches"
              ? `Ranked by research overlap relative to ${lastName}'s profile.`
              : "Browse all researchers in the database."}
          </p>
        </div>

        {/* Toggle */}
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

      {/* Search */}
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

      {/* MATCHES LIST */}
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
                style={{ cursor: "pointer" }}
              >
                <div className="match-row">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div className="name-line hover-underline">{m.profile.name}</div>
                      <span className="tag" style={{ background: "var(--c-mint-pale)", color: "var(--c-forest-deep)", fontWeight: 600, fontSize: "12.5px" }}>
                        {avail.status}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        ⏱ {avail.hoursPerWeek}
                      </span>
                    </div>

                    <div className="meta-line">
                      {m.profile.title} ·{" "}
                      <strong
                        style={{ color: "var(--c-forest-bright)", textDecoration: "underline" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrg({ name: m.profile.institution, ...(ORG_DETAILS[m.profile.institution] || ORG_DETAILS.Default) });
                        }}
                      >
                        🏛️ {m.profile.institution}
                      </strong>
                      {m.sameInstitution && " · 🏫 same institution"}
                    </div>

                    {m.profile.bio && (
                      <p style={{ margin: "12px 0 10px 0", fontSize: "14.5px", color: "var(--text-primary)", lineHeight: "1.5" }}>
                        {m.profile.bio}
                      </p>
                    )}

                    <div style={{ marginTop: 10 }}>
                      {m.sharedInterests?.map((t) => (
                        <span key={t} className="tag shared">
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
                      style={{ fontSize: "13.5px", padding: "8px 16px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCollaborator(m);
                      }}
                    >
                      More Info →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* ALL DIRECTORY LIST */}
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
                      <span className="tag" style={{ background: "var(--c-mint-pale)", color: "var(--c-forest-deep)", fontWeight: 600, fontSize: "12.5px" }}>
                        {avail.status}
                      </span>
                    </div>

                    <div className="meta-line">
                      {p.title} ·{" "}
                      <strong
                        style={{ color: "var(--c-forest-bright)", textDecoration: "underline" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrg({ name: p.institution, ...(ORG_DETAILS[p.institution] || ORG_DETAILS.Default) });
                        }}
                      >
                        🏛️ {p.institution}
                      </strong>
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
                    <button
                      type="button"
                      className="btn-ghost"
                      style={{ fontSize: "13.5px", padding: "7px 14px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCollaborator({ profile: p, score: 0.85, sharedInterests: p.interests, sharedExpertise: p.expertise });
                      }}
                    >
                      More Info →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}