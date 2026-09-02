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
    <div className="card" style={{ maxWidth: 820, margin: "0 0 32px 0" }}>
      <form onSubmit={handleSubmit}>
        {/* Section 1: Basic Information */}
        <div className="form-section">
          <h3 className="form-section-title">1. Basic Information</h3>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                className="form-input"
                value={form.name}
                onChange={update("name")}
                placeholder="e.g. Dr. Jane Smith"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Professional Title</label>
              <input
                className="form-input"
                value={form.title}
                onChange={update("title")}
                placeholder="e.g. Assistant Professor, Postdoctoral Fellow"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Career Stage</label>
            <select
              className="form-select"
              value={form.careerStage}
              onChange={update("careerStage")}
            >
              <option value="early-career">Early-career (Postdoc / Junior PI)</option>
              <option value="mid-career">Mid-career (Associate Professor / Senior Researcher)</option>
              <option value="senior">Senior (Full Professor / Lab Director)</option>
            </select>
          </div>
        </div>

        {/* Section 2: Affiliation */}
        <div className="form-section">
          <h3 className="form-section-title">2. Academic & Lab Affiliation</h3>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Institution / University</label>
              <input
                className="form-input"
                value={form.institution}
                onChange={update("institution")}
                placeholder="e.g. Stanford University"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department / School</label>
              <input
                className="form-input"
                value={form.department}
                onChange={update("department")}
                placeholder="e.g. Computer Science & AI Lab"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Research Focus */}
        <div className="form-section">
          <h3 className="form-section-title">3. Research Domains & Expertise</h3>

          <div className="form-group">
            <label className="form-label">Research Interests (comma-separated)</label>
            <input
              className="form-input"
              value={form.interests}
              onChange={update("interests")}
              placeholder="e.g. federated learning, healthcare AI, NLP"
            />
            <span className="form-hint">Used to calculate research overlap scores with potential collaborators.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Methodological Expertise (comma-separated)</label>
            <input
              className="form-input"
              value={form.expertise}
              onChange={update("expertise")}
              placeholder="e.g. deep learning, distributed systems, PyTorch"
            />
            <span className="form-hint">Complementary expertise helps match cross-disciplinary research teams.</span>
          </div>
        </div>

        {/* Section 4: Summary & Bio */}
        <div className="form-section">
          <h3 className="form-section-title">4. Summary & Verification</h3>

          <div className="form-group">
            <label className="form-label">Short Biography</label>
            <textarea
              className="form-textarea"
              value={form.bio}
              onChange={update("bio")}
              placeholder="Brief overview of current research focus, lab mission, or projects..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">ORCID iD</label>
            <input
              className="form-input"
              value={form.orcid}
              onChange={update("orcid")}
              placeholder="0000-0000-0000-0000"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Create & View Matches
          </button>
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}