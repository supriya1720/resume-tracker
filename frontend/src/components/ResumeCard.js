import { useState, useEffect } from "react";
import API from "../services/api";
import "./Card.css";

export default function ResumeCard({ setFile, addResume }) {

  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    const res = await API.get("/resumes");
    setResumes(res.data);
  };

  const deleteResume = async (id) => {
    await API.delete(`/resumes/${id}`);
    fetchResumes();
  };

  return (
    <div className="card">
      <h3>Resumes</h3>

      <div className="form">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={addResume}>Upload</button>
      </div>

      <div className="list">
        {resumes.map((resume) => (
          <div key={resume._id} className="row">

            <span className="row-title">
              <a
                href={`http://localhost:8000/uploads/${resume.file}`}
                target="_blank"
                rel="noreferrer"
              >
                {resume.file}
              </a>
            </span>

            <button
              className="delete-btn"
              onClick={() => deleteResume(resume._id)}
            >
              🗑
            </button>

          </div>
        ))}
      </div>

    </div>
  );
}