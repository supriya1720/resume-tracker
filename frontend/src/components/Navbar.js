import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  // Show logout only if user exists AND route is /home
  const showLogout = user && location.pathname === "/home";

  return (
    <div className="navbar">
      <div className="logo">Resume Tracker</div>

      {showLogout && (
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      )}
    </div>
  );
}
