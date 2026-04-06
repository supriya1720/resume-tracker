import "./Home.css";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">RT</div>
          <div>
            <h2>Resume Tracker</h2>
            <p>Placement prep made simple</p>
          </div>
        </div>

        <div className="menu">
          <button
            className={location.pathname === "/home" ? "active" : ""}
            onClick={() => navigate("/home")}
          >
            Dashboard
          </button>
          <button
            className={location.pathname === "/home/jobs" ? "active" : ""}
            onClick={() => navigate("/home/jobs")}
          >
            Jobs
          </button>
          <button
            className={location.pathname === "/home/resumes" ? "active" : ""}
            onClick={() => navigate("/home/resumes")}
          >
            Resumes
          </button>
          <button
            className={location.pathname === "/home/tasks" ? "active" : ""}
            onClick={() => navigate("/home/tasks")}
          >
            Tasks
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
