import { useEffect, useState } from "react";
import { getProjects, updateMilestoneStatus } from "../lib/api.js";

const money = (n) => `$${n.toLocaleString()}`;
const STATUSES = ["planned", "in-progress", "done"];

export default function ProjectTracker({ profile }) {
  const [projects, setProjects] = useState(null);

  useEffect(() => {
    let alive = true;
    setProjects(null);
    getProjects(profile.id).then((res) => {
      if (alive) setProjects(res);
    });
    return () => { alive = false; };
  }, [profile]);

  async function handleStatusChange(projectId, milestoneId, status) {
    await updateMilestoneStatus(projectId, milestoneId, status);
    setProjects((prev) =>
      prev.map((p) =>
        p.id !== projectId
          ? p
          : { ...p, milestones: p.milestones.map((m) => (m.id === milestoneId ? { ...m, status } : m)) }
      )
    );
  }

  if (projects === null) return <div className="loading">Loading projects…</div>;

  const totalSecured = projects.reduce(
    (sum, p) => sum + p.funding.filter((f) => f.status === "secured").reduce((s, f) => s + f.amount, 0),
    0
  );
  const totalPubs = projects.reduce((sum, p) => sum + p.publications.length, 0);
  const totalMilestonesDone = projects.reduce(
    (sum, p) => sum + p.milestones.filter((m) => m.status === "done").length,
    0
  );

  return (
    <div>
      <h1 className="page-title">Project tracker</h1>
      <p className="page-sub">Milestones, publications, and secured funding across this researcher's active projects.</p>

      <div className="stat-row">
        <div className="stat-box"><div className="stat-num">{money(totalSecured)}</div><div className="stat-label">Funding secured</div></div>
        <div className="stat-box"><div className="stat-num">{totalPubs}</div><div className="stat-label">Publications</div></div>
        <div className="stat-box"><div className="stat-num">{totalMilestonesDone}</div><div className="stat-label">Milestones completed</div></div>
      </div>

      {projects.length === 0 && <div className="empty">No tracked projects for this researcher yet.</div>}

      {projects.map((project) => (
        <div className="card" key={project.id}>
          <div className="name-line">{project.title}</div>
          <div className="meta-line">
            {project.collaborators.length} collaborator{project.collaborators.length !== 1 ? "s" : ""}
          </div>

          <div className="section-label">Milestones</div>
          <ul className="milestone-list">
            {project.milestones.map((m) => (
              <li className="milestone-item" key={m.id}>
                <span className={`status-dot status-${m.status}`} />
                <span>{m.name}</span>
                <span className="meta-line" style={{ marginLeft: 4 }}>· {m.date}</span>
                <select
                  className="status-select"
                  value={m.status}
                  onChange={(e) => handleStatusChange(project.id, m.id, e.target.value)}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </li>
            ))}
          </ul>

          <div className="section-label">Publications</div>
          {project.publications.map((pub, i) => (
            <div className="pub-item" key={i}>
              {pub.title}
              <div className="pub-venue">{pub.venue} · {pub.year} · {pub.status}</div>
            </div>
          ))}

          <div className="section-label">Funding</div>
          {project.funding.map((f, i) => (
            <div className="pub-item" key={i}>
              {f.source} — <span className="grant-amount">{money(f.amount)}</span>
              <span className="meta-line"> · {f.status}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}