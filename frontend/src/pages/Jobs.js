import { useState, useEffect } from "react";
import API from "../services/api";
import "../components/Card.css";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const res = await API.get("/jobs");
    setJobs(res.data);
  };

  const addJob = async () => {
    if (!company || !role || !status) return;

    await API.post("/jobs", {
      company,
      role,
      status,
    });

    setCompany("");
    setRole("");
    setStatus("");
    fetchJobs();
  };
  const deleteJob = async (id) => {
    await API.delete(`/jobs/${id}`);
    fetchJobs();
  };
  

  return (
    <div className="card">
      <h3>Jobs</h3>

      <div className="form">
        <input
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <input
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
       <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            >
            <option value="">Select Status</option>
            <option value="Applied">Applied</option>
            <option value="Online Assessment">Online Assessment</option>
            <option value="Interview">Interview</option>
            <option value="Rejected">Rejected</option>
            <option value="Selected">Selected</option>
        </select>
        <button onClick={addJob}>Add</button>
      </div>

      <div className="job-table">

        <div className="job-header">
        <span>Company</span>
        <span>Role</span>
        <span>Status</span>
        <span></span>
        </div>

        {jobs.map((job) => (
        <div key={job._id} className="job-row">

        <span>{job.company}</span>
      
        <span>{job.role}</span>
      
        <span>
          <span className={`status-badge ${job.status.replace(" ", "-")}`}>
            {job.status}
          </span>
        </span>
      
        <span>
          <button
            className="delete-btn"
            onClick={() => deleteJob(job._id)}
          >
            🗑
          </button>
        </span>
      
      </div>
     
        ))}

        </div>

    </div>
  );
}
