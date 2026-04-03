import { useState, useEffect } from "react";
import API from "../services/api";
import "./Card.css";

export default function ResumeCard({ setFile, addResume }) {

  const [resumes, setResumes] = useState([]);
  const [expandedResume, setExpandedResume] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    const res = await API.get("/resumes");
    setResumes(res.data);
  };

  const deleteResume = async (id) => {
    await API.delete(`/resumes/${id}`);
    fetchResumes();
  };

  const toggleExpand = (id) => {
    setExpandedResume(expandedResume === id ? null : id);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#22c55e"; // green
    if (score >= 60) return "#f59e0b"; // orange
    return "#ef4444"; // red
  };

  return (
    <div className="card">
      <h3>Resumes</h3>

      <div className="form">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={addResume}>Upload & Analyze</button>
      </div>

      <div className="list">
        {resumes.map((resume) => (
          <div key={resume._id} className="resume-item">
            <div className="row">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                <span className="row-title">
                  <a
                    href={`http://localhost:8000/uploads/${resume.file}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {resume.file}
                  </a>
                </span>
                
                {resume.parsedData?.readinessScore !== undefined && (
                  <span
                    className="readiness-score"
                    style={{
                      background: getScoreColor(resume.parsedData.readinessScore),
                      color: "white",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}
                  >
                    Score: {resume.parsedData.readinessScore}%
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                {resume.parsedData && (
                  <button
                    className="expand-btn"
                    onClick={() => toggleExpand(resume._id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "16px",
                      opacity: 0.7,
                      transition: "0.2s ease"
                    }}
                  >
                    {expandedResume === resume._id ? "▼" : "▶️"}
                  </button>
                )}
                
                <button
                  className="delete-btn"
                  onClick={() => deleteResume(resume._id)}
                >
                  🗑
                </button>
              </div>
            </div>

            {expandedResume === resume._id && resume.parsedData && (
              <div className="resume-analysis" style={{
                marginTop: "12px",
                padding: "15px",
                background: "#f9fafb",
                borderRadius: "8px",
                fontSize: "14px"
              }}>
                {/* Score Breakdown */}
                {resume.parsedData.scoreBreakdown && (
                  <div style={{ marginBottom: "15px" }}>
                    <strong style={{ display: "block", marginBottom: "10px", fontSize: "15px" }}>
                      Score Breakdown:
                    </strong>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div style={{ padding: "8px", background: "#fff", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>Content Quality</div>
                        <div style={{ fontSize: "16px", fontWeight: "600", color: "#2563eb" }}>
                          {resume.parsedData.scoreBreakdown.contentQuality}/20
                        </div>
                      </div>
                      <div style={{ padding: "8px", background: "#fff", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>Skills Coverage</div>
                        <div style={{ fontSize: "16px", fontWeight: "600", color: "#2563eb" }}>
                          {resume.parsedData.scoreBreakdown.skillsCoverage}/20
                        </div>
                      </div>
                      <div style={{ padding: "8px", background: "#fff", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>Structure</div>
                        <div style={{ fontSize: "16px", fontWeight: "600", color: "#2563eb" }}>
                          {resume.parsedData.scoreBreakdown.structureFormatting}/15
                        </div>
                      </div>
                      <div style={{ padding: "8px", background: "#fff", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>Experience</div>
                        <div style={{ fontSize: "16px", fontWeight: "600", color: "#2563eb" }}>
                          {resume.parsedData.scoreBreakdown.experienceProjects}/20
                        </div>
                      </div>
                      <div style={{ padding: "8px", background: "#fff", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>Completeness</div>
                        <div style={{ fontSize: "16px", fontWeight: "600", color: "#2563eb" }}>
                          {resume.parsedData.scoreBreakdown.completeness}/15
                        </div>
                      </div>
                      <div style={{ padding: "8px", background: "#fff", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>Readability</div>
                        <div style={{ fontSize: "16px", fontWeight: "600", color: "#2563eb" }}>
                          {resume.parsedData.scoreBreakdown.readabilityClarity}/10
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Skills Section */}
                {resume.parsedData.skills && resume.parsedData.skills.length > 0 && (
                  <div style={{ marginBottom: "15px" }}>
                    <strong style={{ display: "block", marginBottom: "8px" }}>
                      Extracted Skills ({resume.parsedData.skills.length}):
                    </strong>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {resume.parsedData.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: "#e0e7ff",
                            color: "#3730a3",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px"
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions Section */}
                {resume.parsedData.suggestions && resume.parsedData.suggestions.length > 0 && (
                  <div>
                    <strong style={{ display: "block", marginBottom: "8px" }}>
                      Improvement Suggestions:
                    </strong>
                    <ul style={{
                      margin: 0,
                      paddingLeft: "20px",
                      color: "#6b7280"
                    }}>
                      {resume.parsedData.suggestions.map((suggestion, idx) => (
                        <li key={idx} style={{ marginBottom: "4px" }}>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}