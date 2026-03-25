import "./Home.css";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="layout">
      <aside className="sidebar">

        <div className="menu">
          <p
            className={location.pathname === "/home" ? "active" : ""}
            onClick={() => navigate("/home")}
          >
            Dashboard
          </p>

          <p
            className={location.pathname === "/home/jobs" ? "active" : ""}
            onClick={() => navigate("/home/jobs")}
          >
            Jobs
          </p>

          <p
            className={location.pathname === "/home/resumes" ? "active" : ""}
            onClick={() => navigate("/home/resumes")}
          >
            Resumes
          </p>

          <p
            className={location.pathname === "/home/tasks" ? "active" : ""}
            onClick={() => navigate("/home/tasks")}
          >
            Tasks
          </p>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
