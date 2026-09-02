import { useState } from "react";

const emptyForm = {
  name: "",
  title: "",
  institution: "",
  department: "",
  careerStage: "early-career",
  interests: "",
  expertise: "",
  bio: "",
  orcid: "",
};

export default function ProfileForm({ onCreate, onCancel }) {
  const [form, setForm] = useState(emptyForm);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const newProfile = {
      id: "p" + Date.now(),
      name: form.name.trim(),
      title: form.title.trim(),
      institution: form.institution.trim(),
      department: form.department.trim(),
      careerStage: form.careerStage,
      interests: form.interests
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      expertise: form.expertise
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      bio: form.bio.trim(),
      orcid: form.orcid.trim(),
    };

    onCreate(newProfile);
  };

  return (
    <form className="card" onSubmit={handleSubmit} style={{ maxWidth: 760 }}>
      {/* Section 1: Basic Info */}
      <div className="form-section">
        <div className="section-label" style={{ marginTop: 0 }}>
          1. Basic Information
        </div>

        <div className="form-grid-2">
          <label className="form-field">
            Full Name *
            <input
              value={form.name}
              onChange={update("name")}
              placeholder="e.g. Dr. Jane Smith"
              required
            />
          </label>

          <label className="form-field">
            Professional Title
            <input
              value={form.title}
              onChange={update("title")}
              placeholder="e.g. Assistant Professor, Lead Researcher"
            />
          </label>
        </div>

        <label className="form-field">
          Career Stage
          <select value={form.careerStage} onChange={update("careerStage")}>
            <option value="early-career">Early-career (Postdoc / Junior PI)</option>
            <option value="mid-career">Mid-career (Associate Professor / Senior Researcher)</option>
            <option value="senior">Senior (Full Professor / Lab Director)</option>
          </select>
        </label>
      </div>

      {/* Section 2: Affiliation */}
      <div className="form-section">
        <div className="section-label">2. Academic & Lab Affiliation</div>

        <div className="form-grid-2">
          <label className="form-field">
            Institution
            <input
              value={form.institution}
              onChange={update("institution")}
              placeholder="e.g. Stanford University"
            />
          </label>

          <label className="form-field">
            Department
            <input
              value={form.department}
              onChange={update("department")}
              placeholder="e.g. Computer Science"
            />
          </label>
        </div>
      </div>

      {/* Section 3: Research & Skills */}
      <div className="form-section">
        <div className="section-label">3. Research Domains & Expertise</div>

        <label className="form-field">
          Research Interests (comma-separated)
          <input
            value={form.interests}
            onChange={update("interests")}
            placeholder="e.g. federated learning, healthcare AI, NLP"
          />
          <span className="form-hint">These are used to calculate overlap scores with other researchers.</span>
        </label>

        <label className="form-field">
          Methodological Expertise (comma-separated)
          <input
            value={form.expertise}
            onChange={update("expertise")}
            placeholder="e.g. deep learning, distributed systems, PyTorch"
          />
          <span className="form-hint">Complementary expertise helps match cross-disciplinary teams.</span>
        </label>
      </div>

      {/* Section 4: Bio & ORCID */}
      <div className="form-section">
        <div className="section-label">4. Summary & Verification</div>

        <label className="form-field">
          Short Biography
          <textarea
            value={form.bio}
            onChange={update("bio")}
            placeholder="Brief overview of current projects, lab mission, or research goals..."
            rows={3}
          />
        </label>

        <label className="form-field">
          ORCID iD
          <input
            value={form.orcid}
            onChange={update("orcid")}
            placeholder="0000-0000-0000-0000"
          />
        </label>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button type="submit" className="btn-primary">
          Create & View Matches
        </button>
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}