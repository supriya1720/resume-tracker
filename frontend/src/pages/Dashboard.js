import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [tasks, setTasks] = useState([]);

  const fetchStats = async () => {
    const [applicationsRes, resumesRes, tasksRes] = await Promise.all([
      API.get("/applications"),
      API.get("/resumes"),
      API.get("/tasks"),
    ]);

    setApplications(applicationsRes.data || []);
    setResumes(resumesRes.data || []);
    setTasks(tasksRes.data || []);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const completedTasks = tasks.filter((task) => task.status === "Completed").length;
  const pendingTasks = tasks.length - completedTasks;
  const recentJobs = [...applications]
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
    .slice(0, 4);
  const upcomingTasks = [...tasks]
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  return (
    <div className="dashboard-container">
      <div className="dashboard-page">
        <div className="dashboard-top">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Welcome back, {user?.name} 👋</h1>
            <p className="subtitle">Let's get you closer to your dream job today.</p>
          </div>
          <span className="updated-pill">Last updated 2h ago</span>
        </div>

        <div className="summary-cards">
          <div className="summary-card job-card">
            <div className="summary-label">Jobs Applied</div>
            <h2>{applications.length}</h2>
            <p>Keep applying to stay on track.</p>
          </div>

          <div className="summary-card resume-card">
            <div className="summary-label">Resumes</div>
            <h2>{resumes.length}</h2>
            <p>Maintain your resume to improve your chances.</p>
          </div>

          <div className="summary-card task-card">
            <div className="summary-label">Tasks</div>
            <h2>{completedTasks} / {tasks.length}</h2>
            <p>Complete tasks to stay ahead of your plan.</p>
          </div>
        </div>

        <div className="dashboard-grid">
          <section className="panel applications-panel">
            <div className="panel-header">
              <h2>Recent Applications</h2>
              <Link to="jobs">View all</Link>
            </div>

            {recentJobs.length ? (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Applied</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentJobs.map((job) => (
                      <tr key={job._id}>
                        <td>{job.company || "Unknown"}</td>
                        <td>{job.role || "—"}</td>
                        <td>
                          <span className={`status-pill ${job.status?.toLowerCase()}`}></span>
                          {job.status || "Applied"}
                        </td>
                        <td>{job.appliedAt ? new Date(job.appliedAt).toLocaleString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-state">No recent applications yet.</p>
            )}
          </section>

          <section className="panel tasks-panel">
            <div className="panel-header">
              <h2>Today's Tasks</h2>
              <Link to="tasks">View all</Link>
            </div>

            <ul className="task-list">
              {upcomingTasks.length ? (
                upcomingTasks.map((task) => (
                  <li key={task._id} className={task.status === "Completed" ? "task-completed" : "task-pending"}>
                    <div>
                      <span className="task-title">{task.title || "Untitled task"}</span>
                      <span className="task-meta">{task.status}</span>
                    </div>
                    <div className="task-due">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                    </div>
                  </li>
                ))
              ) : (
                <p className="empty-state">No tasks available. Add one to stay organized.</p>
              )}
            </ul>

            <div className="task-summary">
              <div>
                <span>Pending</span>
                <strong>{pendingTasks}</strong>
              </div>
              <div>
                <span>Completed</span>
                <strong>{completedTasks}</strong>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
