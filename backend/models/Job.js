const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  company: String,
  status: String, // Applied, Interview, Rejected
  dateApplied: Date,
  role: String,
});

module.exports = mongoose.model("Job", jobSchema);
