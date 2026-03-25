import { useState, useEffect } from "react";
import API from "../services/api";
import "./Card.css";

export default function TaskCard() {
  const [tasks, setTasks] = useState([]);

const [status, setStatus] = useState("");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await API.get("/tasks");
    setTasks(res.data);
  };

  const addTask = async () => {

    if (!title) return;
  
    await API.post("/tasks", {
      title,
      status,
      dueDate
    });
  
    setTitle("");
    setStatus("");
    setDueDate("");
  
    fetchTasks();
  };
  const deleteTask = async (id) => {
    await API.delete(`/tasks/${id}`);
    fetchTasks();
  };
  const updateStatus = async (id, status) => {
    await API.put(`/tasks/${id}`, { status });
    fetchTasks();
  };
  
  return (
    <div className="card">
      <h3>Tasks</h3>

      <div className="form">
        <input
            placeholder="New Task"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
        />

        <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
        >
            <option value="">Select Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
        </select>

        <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
        />

        <button onClick={addTask}>Add</button>
    </div>
    

    <div className="job-table">

  <div className="job-header">
    <span>Task</span>
    <span>Due Date</span>
    <span>Status</span>
    <span></span>
  </div>

  {tasks.map((task) => (
    <div key={task._id} className="job-row">

    <span>{task.title}</span>
  
    <span className="due-date">
      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
    </span>
  
    <span>
      <select
        className={`status-badge ${task.status}`}
        value={task.status}
        onChange={(e)=>updateStatus(task._id,e.target.value)}
      >
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
      </select>
    </span>
  
    <span>
      <button
        className="delete-btn"
        onClick={() => deleteTask(task._id)}
      >
        🗑
      </button>
    </span>
  
  </div>
  ))}

</div>

    </div>
  );
}
