import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Resumes from "./pages/Resumes";
import Tasks from "./pages/Tasks";
import PrivateRoute from "./routes/PrivateRoute";
import ApplyJob from "./pages/ApplyJob";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="resumes" element={<Resumes />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="apply-job" element={<ApplyJob />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
