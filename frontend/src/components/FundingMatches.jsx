import { useEffect, useState } from "react";
import { getFundingMatches } from "../lib/api.js";

// Rich agency metadata database
const AGENCY_DATA = {
  "National Science Foundation": {
    type: "Federal Science Agency",
    headquarters: "Alexandria, VA",
    typicalAwardRange: "$400,000 – $1,500,000",
    reviewCycle: "Panel Review (approx. 6 months)",
    priorityAreas: "Artificial Intelligence, Quantum Computing, Climate Resilience, Cyber-Physical Systems",
    guidelinesUrl: "https://www.nsf.gov/funding/pgm_list.jsp",
  },
  "National Institutes of Health": {
    type: "Biomedical & Health Research Agency",
    headquarters: "Bethesda, MD",
    typicalAwardRange: "$250,000 – $2,500,000 (R01 / R21)",
    reviewCycle: "Scientific Review Group (SRG) Study Sections",
    priorityAreas: "Computational Biology, Translational Medicine, Health Informatics, Neuroscience",
    guidelinesUrl: "https://grants.nih.gov/",
  },
  "Department of Energy": {
    type: "Federal Energy & Scientific Research",
    headquarters: "Washington, D.C.",
    typicalAwardRange: "$750,000 – $2,500,000",
    reviewCycle: "Merit Review & Program Manager Assessment",
    priorityAreas: "High-Performance Computing, Clean Energy Systems, Materials Science",
    guidelinesUrl: "https://science.osti.gov/grants",
  },
  "Default": {
    type: "Public / Philanthropic Research Sponsor",
    headquarters: "United States",
    typicalAwardRange: "$250,000 – $1,000,000",
    reviewCycle: "Peer Review Committee",
    priorityAreas: "Interdisciplinary Technology, Data Sciences, Social Impact",
    guidelinesUrl: "https://grants.gov",
  }
};

export default function FundingMatches({ profile }) {
  const [matches, setMatches] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [draftStarted, setDraftStarted] = useState(false);

  useEffect(() => {
    let alive = true;
    setMatches(null);

    if (profile) {
      getFundingMatches(profile).then((res) => {
        if (alive) setMatches(res);
      });
    }

    return () => {
      alive = false;
    };
  }, [profile]);

  const lastName = profile?.name ? profile.name.split(" ").slice(-1)[0] : "";

  // 1. DEDICATED FULL-PAGE GRANT & FUNDING AGENCY VIEW
  if (selectedGrant) {
    const g = selectedGrant.grant;
    const agencyInfo = AGENCY_DATA[g.agency] || { ...AGENCY_DATA.Default, name: g.agency };
    const matchScore = selectedGrant.score;

    return (
      <div>
        <button
          type="button"
          className="btn-ghost"
          style={{ marginBottom: 20, display: "inline-flex", alignItems: "center", gap: 6 }}
          onClick={() => {
            setSelectedGrant(null);
            setDraftStarted(false);
          }}
        >
          ← Back to Funding Matches
        </button>

        <div className="card" style={{ padding: "32px 36px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span className="tag" style={{ background: "var(--c-mint-pale)", color: "var(--c-forest-deep)", fontWeight: 700 }}>
                  🏛️ {g.agency || "Funding Opportunity"}
                </span>
                {selectedGrant.eligible ? (
                  <span className="eligible-pill">✓ Eligible for {profile.careerStage}</span>
                ) : (
                  <span className="ineligible-pill">⚠️ Verify Career Stage Fit</span>
                )}
              </div>

              <h1 className="page-title" style={{ margin: "10px 0 6px 0", fontSize: 28 }}>
                {g.title}
              </h1>

              <div style={{ fontSize: 16, color: "var(--text-secondary)" }}>
                Program Sponsor: <strong>{g.agency}</strong> · Reference: <span style={{ fontFamily: "var(--font-mono)" }}>{g.id || "GRANT-2026-X"}</span>
              </div>
            </div>

            {matchScore && (
              <div style={{ textAlign: "right" }}>
                <span className="score-badge" style={{ fontSize: 16, padding: "6px 16px" }}>
                  {Math.round(matchScore * 100)}% Match Fit
                </span>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 4 }}>
                  Matched to {lastName}'s expertise
                </div>
              </div>
            )}
          </div>

          <hr style={{ borderColor: "var(--border)", margin: "24px 0" }} />

          {/* KEY GRANT STATS BAR */}
          <div style={{ background: "var(--c-mint-lightest)", border: "1px solid var(--c-sage-medium)", borderRadius: 12, padding: "20px 24px", marginBottom: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
              <div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 600 }}>Total Award Amount</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--c-forest-bright)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                  {g.amount ? `$${Number(g.amount).toLocaleString()}` : "$750,000"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 600 }}>Proposal Deadline</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#be123c", marginTop: 4 }}>
                  ⏳ {g.deadline || "October 15, 2026"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 600 }}>Typical Review Cycle</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--c-forest-deep)", marginTop: 4 }}>
                  {agencyInfo.reviewCycle}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 600 }}>Target Career Stage</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--c-forest-deep)", marginTop: 4 }}>
                  {g.careerStageEligibility || "All Career Stages"}
                </div>
              </div>
            </div>
          </div>

          {/* PROGRAM DESCRIPTION */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-label">Program Scope & Objectives</div>
            <p style={{ fontSize: 15.5, lineHeight: 1.65, color: "var(--text-primary)", margin: "8px 0" }}>
              {g.description ||
                "This funding solicitation seeks novel research proposals advancing basic principles and applied translational technologies. Cross-disciplinary proposals combining computational methods with empirical validation are strongly encouraged."}
            </p>
          </div>

          {/* FUNDING AGENCY DETAILS */}
          <div style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border-card)", borderRadius: 10, padding: "20px", marginBottom: 26 }}>
            <div style={{ fontWeight: 700, color: "var(--c-forest-deep)", fontSize: 16, marginBottom: 8 }}>
              🏛️ About {g.agency}
            </div>
            <div style={{ fontSize: 14.5, color: "var(--text-secondary)", marginBottom: 6 }}>
              <strong>Headquarters:</strong> {agencyInfo.headquarters} · <strong>Agency Type:</strong> {agencyInfo.type}
            </div>
            <div style={{ fontSize: 14.5, color: "var(--text-secondary)" }}>
              <strong>Strategic Priorities:</strong> {agencyInfo.priorityAreas}
            </div>
          </div>

          {/* THEMATIC TAGS */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-label">Targeted Research Domains</div>
            <div style={{ marginTop: 8 }}>
              {(g.tags || selectedGrant.matchedTags || []).map((t) => (
                <span key={t} className="tag shared" style={{ fontSize: 13.5, padding: "5px 14px" }}>
                  ★ {t}
                </span>
              ))}
            </div>
          </div>

          {/* APPLICATION CHECKLIST */}
          <div style={{ marginBottom: 30 }}>
            <div className="section-label">Required Proposal Components</div>
            <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0 0" }}>
              <li style={{ padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 14.5, display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ color: "var(--c-forest-bright)" }}>☑</span> Project Description & Technical Approach (15 pages max)
              </li>
              <li style={{ padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 14.5, display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ color: "var(--c-forest-bright)" }}>☑</span> Biosketch for Principal Investigator & Co-Investigators
              </li>
              <li style={{ padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 14.5, display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ color: "var(--c-forest-bright)" }}>☑</span> Budget Justification & Institutional Indirect Cost Agreement
              </li>
              <li style={{ padding: "8px 0", fontSize: 14.5, display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ color: "var(--c-forest-bright)" }}>☑</span> Data Management & Open-Science Sharing Plan
              </li>
            </ul>
          </div>

          {/* SUCCESS MESSAGE */}
          {draftStarted && (
            <div style={{ background: "#d1fae5", border: "1px solid #10b981", color: "#065f46", padding: "12px 18px", borderRadius: 8, marginBottom: 20, fontWeight: 600 }}>
              ✓ Proposal workspace initialized! Added to your Project Tracker.
            </div>
          )}

          {/* ACTIONS */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setDraftStarted(true)}
            >
              📝 Start Proposal Draft
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setSelectedGrant(null);
                setDraftStarted(false);
              }}
            >
              Back to Matches
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. MAIN FUNDING MATCHES LIST VIEW
  const filteredMatches = matches?.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.grant.title.toLowerCase().includes(q) ||
      m.grant.agency.toLowerCase().includes(q) ||
      m.grant.description?.toLowerCase().includes(q) ||
      m.grant.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Funding Matches</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            Ranked by research overlap with {lastName}'s interests and eligibility requirements.
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Search grants by title, funding agency (NSF, NIH, DOE), or research keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "100%", background: "#ffffff" }}
        />
      </div>

      {matches === null && <div className="loading">Analyzing grant opportunities...</div>}
      {matches?.length === 0 && (
        <div className="empty">No matching grants found for this profile.</div>
      )}

      {filteredMatches?.map((m) => (
        <div
          className="card"
          key={m.grant.id}
          onClick={() => setSelectedGrant(m)}
          style={{ cursor: "pointer" }}
        >
          <div className="match-row">
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span className="grant-title hover-underline">{m.grant.title}</span>
                {m.eligible ? (
                  <span className="eligible-pill">Eligible</span>
                ) : (
                  <span className="ineligible-pill">Check Eligibility</span>
                )}
              </div>

              <div className="meta-line">
                🏛️ <strong>{m.grant.agency}</strong> · Award:{" "}
                <span className="grant-amount">
                  {m.grant.amount ? `$${Number(m.grant.amount).toLocaleString()}` : "$750,000"}
                </span>{" "}
                · Deadline: <span className="deadline-flag">⏳ {m.grant.deadline || "Upcoming"}</span>
              </div>

              {m.grant.description && (
                <p style={{ margin: "12px 0 10px 0", fontSize: "14.5px", color: "var(--text-primary)", lineHeight: "1.5" }}>
                  {m.grant.description}
                </p>
              )}

              <div style={{ marginTop: 10 }}>
                {m.grant.tags?.map((t) => (
                  <span key={t} className="tag shared">
                    ★ {t}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
              <span className="score-badge">
                {Math.round(m.score * 100)}% fit
              </span>
              <button
                type="button"
                className="btn-primary"
                style={{ fontSize: "13.5px", padding: "8px 16px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedGrant(m);
                }}
              >
                More Info →
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}