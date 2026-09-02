import { useEffect, useState } from "react";
import { getFundingMatches } from "../lib/api.js";
import ScoreBar from "./ScoreBar.jsx";

const money = (n) => `$${n.toLocaleString()}`;

export default function FundingMatches({ profile }) {
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    let alive = true;
    setMatches(null);
    getFundingMatches(profile).then((res) => {
      if (alive) setMatches(res);
    });
    return () => { alive = false; };
  }, [profile]);

  return (
    <div>
      <h1 className="page-title">Funding recommendations</h1>
      <p className="page-sub">
        Grants ranked by tag overlap with {profile.name.split(" ").slice(-1)[0]}'s interests and
        expertise. Career-stage eligibility is flagged, not filtered.
      </p>

      {matches === null && <div className="loading">Scanning open calls…</div>}
      {matches?.length === 0 && <div className="empty">No relevant grants in the current sample pool.</div>}

      {matches?.map((m) => (
        <div className="card" key={m.grant.id}>
          <div className="match-row">
            <div style={{ flex: 1 }}>
              <div className="grant-title">{m.grant.title}</div>
              <div className="meta-line">{m.grant.agency}</div>
              <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: "8px 0" }}>
                {m.grant.description}
              </p>
              <div>
                {m.matchedTags.map((t) => <span key={t} className="tag shared">{t}</span>)}
              </div>
              <ScoreBar score={m.score} />
              <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center", fontSize: 13 }}>
                <span className="grant-amount">{money(m.grant.amount)}</span>
                <span className={m.eligible ? "eligible-pill" : "ineligible-pill"}>
                  {m.eligible ? "Eligible" : "Check eligibility"}
                </span>
                <span className="deadline-flag">
                  Due {m.grant.deadline} ({m.daysToDeadline > 0 ? `${m.daysToDeadline}d left` : "closed"})
                </span>
              </div>
            </div>
            <span className="score-badge">{Math.round(m.score * 100)}% fit</span>
          </div>
        </div>
      ))}
    </div>
  );
}