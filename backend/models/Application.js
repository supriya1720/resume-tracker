const mongoose = require("mongoose");  // ✅ make sure this is the first line

const applicationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" }, // ✅ add this
  
    company: String,
    role: String,
  
    fullName: String,
    immediateJoin: Boolean,
    indianCitizen: Boolean,
    relocate: Boolean,
    experienceLevel: String,
  
    resume: String,
    appliedAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model("Application", applicationSchema);