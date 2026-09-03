import React from 'react';
export default function ScoreBar({ score }) {
  const pct = Math.round(score * 100);
  return (
    <div className="score-bar-track" aria-label={`Match score ${pct} percent`}>
      <div className="score-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}