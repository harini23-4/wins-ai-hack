import { useEffect, useState } from "react";
import { getCollaboratorMatches } from "../lib/api.js";
import ScoreBar from "./ScoreBar.jsx";

export default function CollaboratorMatches({ profile }) {
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    let alive = true;
    setMatches(null);

    if (profile) {
      getCollaboratorMatches(profile).then((res) => {
        if (alive) setMatches(res);
      });
    }

    return () => {
      alive = false;
    };
  }, [profile]);

  const lastName = profile?.name ? profile.name.split(" ").slice(-1)[0] : "";

  return (
    <div>
      <h1 className="page-title">Collaborator matches</h1>
      <p className="page-sub">
        Ranked by overlap in stated research interests and complementary expertise,
        relative to {lastName}'s profile.
      </p>

      {matches === null && <div className="loading">Finding matches...</div>}
      {matches?.length === 0 && (
        <div className="empty">No strong matches in the current sample pool.</div>
      )}

      {matches?.map((m) => (
        <div className="card" key={m.profile.id}>
          <div className="match-row">
            <div style={{ flex: 1 }}>
              <div className="name-line">{m.profile.name}</div>
              <div className="meta-line">
                {m.profile.title} · {m.profile.institution}
                {m.sameInstitution && " · same institution"}
              </div>
              <div style={{ marginTop: 10 }}>
                {m.sharedInterests?.map((t) => (
                  <span key={t} className="tag shared">
                    {t}
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
            <span className="score-badge">
              {Math.round(m.score * 100)}% match
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}