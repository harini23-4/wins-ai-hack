import React from 'react';
export default function ProfileOverview({ profile }) {
  if (!profile) return null;
  return (
    <div className="card profile-header">
      <div>
        <div className="name-line" style={{ fontSize: 19 }}>{profile.name}</div>
        <div className="meta-line">{profile.title} · {profile.institution}</div>
        <p style={{ fontSize: 14, marginTop: 10, maxWidth: "58ch", color: "var(--ink-soft)" }}>
          {profile.bio}
        </p>
        <div style={{ marginTop: 8 }}>
          {profile.interests.map((t) => <span key={t} className="tag">{t}</span>)}
        </div>
      </div>
    </div>
  );
}