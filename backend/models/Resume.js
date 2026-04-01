const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  file: String,
  parsedData: {
    sections: { type: Map, of: String },
    skills: [String],
    readinessScore: { type: Number, default: 0 },
    suggestions: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Resume", resumeSchema);
