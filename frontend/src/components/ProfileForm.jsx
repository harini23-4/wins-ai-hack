import { useState, useEffect } from "react";

const defaultEmptyForm = {
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

export default function ProfileForm({ initialProfile, onSave, onCancel }) {
  const [form, setForm] = useState(defaultEmptyForm);
  const isEditing = Boolean(initialProfile?.id);

  // Pre-fill form when editing an existing profile
  useEffect(() => {
    if (initialProfile) {
      setForm({
        name: initialProfile.name || "",
        title: initialProfile.title || "",
        institution: initialProfile.institution || "",
        department: initialProfile.department || "",
        careerStage: initialProfile.careerStage || "early-career",
        interests: Array.isArray(initialProfile.interests)
          ? initialProfile.interests.join(", ")
          : initialProfile.interests || "",
        expertise: Array.isArray(initialProfile.expertise)
          ? initialProfile.expertise.join(", ")
          : initialProfile.expertise || "",
        bio: initialProfile.bio || "",
        orcid: initialProfile.orcid || "",
      });
    } else {
      setForm(defaultEmptyForm);
    }
  }, [initialProfile]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const savedProfile = {
      id: initialProfile?.id || "p" + Date.now(),
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

    onSave(savedProfile);
  };

  return (
    <div className="card" style={{ maxWidth: 820, margin: "0 0 32px 0" }}>
      <form onSubmit={handleSubmit}>
        {/* Section 1: Basic Information */}
        <div className="form-section">
          <h3 className="form-section-title">
            {isEditing ? "✏️ Edit Basic Information" : "1. Basic Information"}
          </h3>

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
                placeholder="e.g. Associate Professor, Lead PI"
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
          <h3 className="form-section-title">
            {isEditing ? "🏫 Edit Affiliation" : "2. Academic & Lab Affiliation"}
          </h3>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Institution / University</label>
              <input
                className="form-input"
                value={form.institution}
                onChange={update("institution")}
                placeholder="e.g. Rivertown University"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department / School</label>
              <input
                className="form-input"
                value={form.department}
                onChange={update("department")}
                placeholder="e.g. Computer Science"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Research Focus */}
        <div className="form-section">
          <h3 className="form-section-title">
            {isEditing ? "🔬 Edit Research Domains & Skills" : "3. Research Domains & Expertise"}
          </h3>

          <div className="form-group">
            <label className="form-label">Research Interests (comma-separated)</label>
            <input
              className="form-input"
              value={form.interests}
              onChange={update("interests")}
              placeholder="e.g. federated learning, healthcare AI, NLP"
            />
            <span className="form-hint">Used for live AI collaborator & grant compatibility scores.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Methodological Expertise (comma-separated)</label>
            <input
              className="form-input"
              value={form.expertise}
              onChange={update("expertise")}
              placeholder="e.g. machine learning, systems, differential privacy"
            />
            <span className="form-hint">Complementary skills help match cross-disciplinary teams.</span>
          </div>
        </div>

        {/* Section 4: Summary & Bio */}
        <div className="form-section">
          <h3 className="form-section-title">
            {isEditing ? "📝 Edit Bio & ORCID" : "4. Summary & Verification"}
          </h3>

          <div className="form-group">
            <label className="form-label">Short Biography</label>
            <textarea
              className="form-textarea"
              value={form.bio}
              onChange={update("bio")}
              placeholder="Brief overview of research focus, mission, or projects..."
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
            {isEditing ? "💾 Save Changes" : "Create & View Matches"}
          </button>
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}