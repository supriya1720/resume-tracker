import { useEffect, useState } from "react";
import API from "../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [stats, setStats] = useState({
    jobs: 0,
    resumes: 0,
    tasks: 0,
  });

  const fetchStats = async () => {
    const jobs = await API.get("/jobs");
    const resumes = await API.get("/resumes");
    const tasks = await API.get("/tasks");

    setStats({
      jobs: jobs.data.length,
      resumes: resumes.data.length,
      tasks: tasks.data.length,
    });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Welcome back, {user?.name} 👋</h1>

        <div className="stats">
          <div className="stat-box">
            <h3>{stats.jobs}</h3>
            <span>Jobs Applied</span>
          </div>

          <div className="stat-box">
            <h3>{stats.resumes}</h3>
            <span>Resumes</span>
          </div>

          <div className="stat-box">
            <h3>{stats.tasks}</h3>
            <span>Tasks</span>
          </div>
        </div>
      </div>
    </div>
  );
}
