import { useEffect, useState } from "react";
import { getCollaboratorMatches, getProfiles } from "../lib/api.js";
import ScoreBar from "./ScoreBar.jsx";

export default function CollaboratorMatches({ profile }) {
  const [matches, setMatches] = useState(null);
  const [allProfiles, setAllProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("matches"); // 'matches' | 'all'

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

  // Filter matches by search query
  const filteredMatches = matches?.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.profile.name.toLowerCase().includes(q) ||
      m.profile.institution.toLowerCase().includes(q) ||
      m.profile.bio?.toLowerCase().includes(q) ||
      m.sharedInterests?.some((t) => t.toLowerCase().includes(q))
    );
  });

  // Filter all profiles by search query
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Collaborator Network</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            {viewMode === "matches"
              ? `Ranked by research overlap and complementary expertise relative to ${lastName}'s profile.`
              : "Browse all researchers and potential collaborators in the network."}
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
          placeholder="🔍 Search collaborators by name, institution, research field, or bio keywords..."
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

          {filteredMatches?.map((m) => (
            <div className="card" key={m.profile.id}>
              <div className="match-row">
                <div style={{ flex: 1 }}>
                  <div className="name-line">{m.profile.name}</div>
                  <div className="meta-line">
                    {m.profile.title} · {m.profile.institution}
                    {m.sameInstitution && " · 🏫 same institution"}
                  </div>

                  {/* Collaborator Description / Bio */}
                  {m.profile.bio && (
                    <p style={{ margin: "12px 0 10px 0", fontSize: "14.5px", color: "var(--text-primary)", lineHeight: "1.5" }}>
                      {m.profile.bio}
                    </p>
                  )}

                  {/* Tags */}
                  <div style={{ marginTop: 10 }}>
                    {m.sharedInterests?.map((t) => (
                      <span key={t} className="tag shared" title="Shared research interest">
                        ★ {t}
                      </span>
                    ))}
                    {m.sharedExpertise?.map((t) => (
                      <span key={"e-" + t} className="tag" title="Complementary expertise">
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
                  <button type="button" className="btn-ghost" style={{ fontSize: "13px", padding: "6px 12px" }}>
                    ✉ Connect
                  </button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* ALL COLLABORATORS DIRECTORY VIEW */}
      {viewMode === "all" && (
        <div>
          {filteredAll.map((p) => (
            <div className="card" key={p.id}>
              <div className="match-row">
                <div style={{ flex: 1 }}>
                  <div className="name-line">{p.name}</div>
                  <div className="meta-line">
                    {p.title} · {p.institution} ({p.department || "General"})
                  </div>

                  {/* Description / Bio */}
                  {p.bio ? (
                    <p style={{ margin: "12px 0 10px 0", fontSize: "14.5px", color: "var(--text-primary)", lineHeight: "1.5" }}>
                      {p.bio}
                    </p>
                  ) : (
                    <p style={{ margin: "10px 0", fontSize: "13.5px", color: "var(--text-muted)", fontStyle: "italic" }}>
                      No biography provided.
                    </p>
                  )}

                  {/* Interests & Skills */}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--c-forest-bright)", textTransform: "uppercase", marginBottom: 4 }}>
                      Research Interests
                    </div>
                    {p.interests?.map((t) => (
                      <span key={t} className="tag shared">
                        {t}
                      </span>
                    ))}
                  </div>

                  {p.expertise?.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4 }}>
                        Expertise
                      </div>
                      {p.expertise?.map((t) => (
                        <span key={"all-e-" + t} className="tag">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                  <span className="tag" style={{ background: "var(--c-mint-pale)", borderColor: "var(--c-sage-medium)", color: "var(--c-forest-deep)", fontWeight: 600 }}>
                    {p.careerStage || "Researcher"}
                  </span>
                  <button type="button" className="btn-ghost" style={{ fontSize: "13px", padding: "6px 12px" }}>
                    ✉ Invite
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}