import { useState } from "react";
import API from "../services/api";
import ResumeCard from "../components/ResumeCard";

export default function Resumes() {

  const [file, setFile] = useState(null);

  const addResume = async () => {

    if (!file) return;
  
    const formData = new FormData();
    formData.append("resume", file);
  
   // Use the analyze endpoint to parse and analyze the resume
   await API.post("/resumes/analyze-resume", formData);
  
    window.location.reload(); // refresh list after upload
  };

  return (
    <ResumeCard
      setFile={setFile}
      addResume={addResume}
    />
  );
}