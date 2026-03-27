import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../services/api";
import "../components/Card.css";

export default function ApplyJob() {
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state?.job || {}; // get full job object

  const [resumes, setResumes] = useState([]);
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
    setResumes(res.data);
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
      state: { newAppliedJob: job._id }, // send job ID to mark applied immediately
    });
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
          <select onChange={(e) => setForm({ ...form, resume: e.target.value })}>
            <option value="">Select Resume</option>
            {resumes.map((r) => (
              <option key={r._id} value={r.fileName}>
                {r.fileName}
              </option>
            ))}
          </select>
        </div>

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