import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "./Login.css";


export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({});

  const submit = async () => {
    try {
      const res = await API.post("/users/login", form);
  
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
  
      navigate("/home");
    } catch (err) {
      alert("Invalid credentials");
    }
  };
  
  

  return (
    <div className="auth-container">
      <h2>Login</h2>

      <input placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})}/>
      <input placeholder="Password" type="password" onChange={e=>setForm({...form,password:e.target.value})}/>

      <button onClick={submit}>Login</button>

      <p>
        New user? <Link to="/signup">Signup</Link>
      </p>
    </div>
  );
}
