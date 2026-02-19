const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();

// Connect Database
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/resumes", require("./routes/resumeRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));


// Test route
app.get("/", (req, res) => {
  res.send("SERVER WORKING");
});

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`SERVER STARTED ON ${PORT}`);
});
