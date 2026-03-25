import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "./Signup.css";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({});

  const submit = async () => {
    try {
      const res = await API.post("/users/register", form);

  
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
  
      navigate("/home");
    } catch (err) {
      alert("Error registering");
    }
  };
  

  return (
    <div className="auth-container">
      <h2>Signup</h2>

      <input placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})}/>
      <input placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})}/>
      <input placeholder="Password" type="password" onChange={e=>setForm({...form,password:e.target.value})}/>

      <button onClick={submit}>Signup</button>

      <p>
        Already have account? <Link to="/">Login</Link>
      </p>
    </div>
  );
}
