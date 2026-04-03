import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../services/api";
import "../components/Card.css";

export default function ApplyJob() {
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state?.job || {}; // get full job object

  const [resumes, setResumes] = useState([]);
  const [matchResult, setMatchResult] = useState(null);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [addingToTask, setAddingToTask] = useState({});
  const [addedToTask, setAddedToTask] = useState({});
  const [form, setForm] = useState({
    fullName: "",
    immediateJoin: false,
    indianCitizen: false,
    relocate: false,
    experienceLevel: "",
    resume: "",
  });

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    const res = await API.get("/resumes");
    console.log("RESUMES RESPONSE:", res.data);   // add this line

    setResumes(res.data);
  };
  const handleResumeSelect = async (e) => {
    const resumeFile = e.target.value;
    setForm({ ...form, resume: resumeFile });
    
    // Find the selected resume object
    const selectedResume = resumes.find(r => r.file === resumeFile);
    
    if (selectedResume) {
      setSelectedResumeId(selectedResume._id);
      
      // Get job skills from skills_suggest or extract from description
      let jobSkills = job.skills_suggest || [];
      
      // If no skills_suggest, try to extract from job description or title
      if (!jobSkills || jobSkills.length === 0) {
        console.log("No skills_suggest found, job might not have required skills defined");
        // You could add logic here to extract skills from job description if needed
        setMatchResult(null);
        return;
      }
      
      try {
        console.log("Matching resume with job skills:", jobSkills);
        // Call the match API
        const matchRes = await API.post("/jobs/match-job", {
          resumeId: selectedResume._id,
          jobSkills: jobSkills
        });
        
        console.log("Match result:", matchRes.data);
        setMatchResult(matchRes.data);
      } catch (error) {
        console.error("Error matching job:", error);
        console.error("Error details:", error.response?.data);
        setMatchResult(null);
      }
    } else {
      setMatchResult(null);
      setSelectedResumeId("");
    }
  };

  const addSkillToTask = async (skill) => {
    setAddingToTask({ ...addingToTask, [skill]: true });
    
    try {
      await API.post("/tasks", {
        title: `Learn ${skill}`,
        description: `Study and practice ${skill} for ${job.title} role at ${job.owner?.companyName}`,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        status: "Pending"
      });
      
      setAddingToTask({ ...addingToTask, [skill]: false });
      setAddedToTask({ ...addedToTask, [skill]: true });
      alert(`"Learn ${skill}" added to your tasks!`);
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task. Please try again.");
      setAddingToTask({ ...addingToTask, [skill]: false });
    }
  };

  const submitApplication = async () => {
    await API.post("/applications", {
      ...form,
      job: job._id,
      company: job.owner?.companyName,
      role: job.title,
    });
  
    alert("Application submitted!");
  
    navigate("/home/jobs", {
      state: {
        newAppliedJob: {
          role: job.title,
          company: job.owner?.companyName,
        },
      },
    });
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 70) return "#22c55e"; // green
    if (percentage >= 40) return "#f59e0b"; // orange
    return "#ef4444"; // red
  };

  return (
    <div className="card">
      {/* Job details above the form */}
      <div className="job-details">
        <h2>{job.title}</h2>
        <p><strong>Company:</strong> {job.owner?.companyName}</p>
        <p><strong>Location:</strong> {job.location || "Remote"}</p>
        <p><strong>Skills Suggested:</strong> {job.skills_suggest?.join(", ") || "N/A"}</p>
        <p><strong>Summary:</strong> {job.descriptionBreakdown?.oneSentenceJobSummary || "N/A"}</p>
        <p><strong>URL:</strong> <a href={job.url} target="_blank">{job.url}</a></p>
      </div>

      {/* Apply form */}
      <div className="apply-form">
        {/* Your form fields */}
        <div className="form-row">
          <label>Full Name</label>
          <input
            placeholder="Enter your full name"
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </div>

        <div className="form-row checkbox-row">
          <label>
            <input
              type="checkbox"
              onChange={(e) => setForm({ ...form, immediateJoin: e.target.checked })}
            />
            Ready for immediate joining
          </label>
        </div>

        <div className="form-row checkbox-row">
          <label>
            <input
              type="checkbox"
              onChange={(e) => setForm({ ...form, indianCitizen: e.target.checked })}
            />
            Indian Citizen
          </label>
        </div>

        <div className="form-row checkbox-row">
          <label>
            <input
              type="checkbox"
              onChange={(e) => setForm({ ...form, relocate: e.target.checked })}
            />
            Willing to relocate
          </label>
        </div>

        <div className="form-row">
          <label>Experience Level</label>
          <select
            onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
          >
            <option value="">Select Experience</option>
            <option>Fresher</option>
            <option>Experienced</option>
          </select>
        </div>

        <div className="form-row">
          <label>Select Resume</label>
          <select onChange={handleResumeSelect} value={form.resume}>
            <option value="">Select Resume</option>
                {resumes.map((r) => (
                    <option key={r._id} value={r.file}>
                        {r.file} {r.parsedData?.readinessScore ? `(Score: ${r.parsedData.readinessScore}%)` : ""}
                    </option>
                    ))}
          </select>
        </div>
        {/* Job Match Analysis */}
        {matchResult && (
          <div className="match-analysis" style={{
            marginTop: "20px",
            padding: "20px",
            background: "#f9fafb",
            borderRadius: "12px",
            border: "2px solid #e5e7eb"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "15px"
            }}>
              <h4 style={{ margin: 0, fontSize: "16px" }}>Job Match Analysis</h4>
              <span style={{
                background: getMatchColor(matchResult.matchPercentage),
                color: "white",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "600"
              }}>
                {matchResult.matchPercentage}% Match
              </span>
            </div>

            {/* Matched Skills */}
            {matchResult.matchedSkills && matchResult.matchedSkills.length > 0 && (
              <div style={{ marginBottom: "15px" }}>
                <strong style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "#22c55e"
                }}>
                  ✓ Matched Skills ({matchResult.matchedSkills.length}):
                </strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {matchResult.matchedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: "#dcfce7",
                        color: "#166534",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        border: "1px solid #86efac"
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {matchResult.missingSkills && matchResult.missingSkills.length > 0 && (
              <div>
                <strong style={{
                  display: "block",
                  marginBottom: "12px",
                  fontSize: "14px",
                  color: "#ef4444"
                }}>
                  ✗ Missing Skills ({matchResult.missingSkills.length}):
                </strong>
                <ul style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0
                }}>
                  {matchResult.missingSkills.map((skill, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        marginBottom: "8px",
                        background: "#fee2e2",
                        borderRadius: "8px",
                        border: "1px solid #fca5a5"
                      }}
                    >
                      <span style={{
                        color: "#991b1b",
                        fontSize: "13px",
                        fontWeight: "500"
                      }}>
                        • {skill}
                      </span>
                      <button
                        onClick={() => addSkillToTask(skill)}
                        disabled={addingToTask[skill] || addedToTask[skill]}
                        style={{
                          background: addedToTask[skill] ? "#22c55e" : (addingToTask[skill] ? "#9ca3af" : "#2563eb"),
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: (addingToTask[skill] || addedToTask[skill]) ? "not-allowed" : "pointer",
                          fontWeight: "500",
                          transition: "background 0.2s"
                        }}
                        onMouseOver={(e) => {
                          if (!addingToTask[skill] && !addedToTask[skill]) {
                            e.target.style.background = "#1e40af";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!addingToTask[skill] && !addedToTask[skill]) {
                            e.target.style.background = "#2563eb";
                          }
                        }}
                      >
                        {addedToTask[skill] ? "✓ Added" : (addingToTask[skill] ? "Adding..." : "+ Add to Task")}
                      </button>
                    </li>
                  ))}
                </ul>
                <p style={{
                  marginTop: "12px",
                  fontSize: "13px",
                  color: "#6b7280",
                  fontStyle: "italic"
                }}>
                  💡 Click "Add to Task" to create a learning task for any missing skill.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="form-actions">
          <button className="cancel-btn" onClick={() => navigate("/home/jobs")}>
            Cancel
          </button>

          <button className="submit-btn" onClick={submitApplication}>
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
}