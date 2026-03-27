import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import API from "../services/api";
import "../components/Card.css";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchJobs();         
    fetchAppliedJobs();  
  }, []);
  const fetchJobs = async () => {
    try {
      const res = await axios.get(
        "https://api.joinrise.io/api/v1/jobs/public?page=1&limit=50"
      );
      const jobsList = res.data?.result?.jobs || [];
      setJobs(jobsList);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const res = await API.get("/applications"); // this should return all applied jobs
      setAppliedJobs(res.data || []);
    } catch (err) {
      console.error("Error fetching applied jobs:", err);
      setAppliedJobs([]);
    }
  };

  const isApplied = (job) => {
    return appliedJobs.some(
      (applied) =>
        applied.role === job.title &&
        applied.company === job.owner?.companyName
    );
  };

  return (
    <div className="card">
      <h3>Available Jobs</h3>
      <div className="jobs-grid">
        {jobs.map((job, index) => (
          <div key={index} className="job-card">
            <h4>{job.title}</h4>
            <p className="company">{job.owner?.companyName}</p>
            <p className="location">{job.location || "Remote"}</p>

            <button
              className={isApplied(job) ? "applied-btn" : "apply-btn"}
              onClick={() => {
                if (isApplied(job)) {
                  alert("Already applied");
                  return;
                }
                navigate("/home/apply-job", { state: { job } });
              }}
            >
              {isApplied(job) ? "Applied" : "Apply"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}