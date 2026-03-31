const Job = require("../models/Job");

exports.addJob = async (req, res) => {

  const job = await Job.create({
    user: req.user,
    ...req.body
  });
  res.json(job);
};

exports.getJobs = async (req, res) => {
  const jobs = await Job.find({ user: req.user });
  res.json(jobs);
};
exports.deleteJob = async (req, res) => {
  await Job.findOneAndDelete({
    _id: req.params.id,
    user: req.user      // ✅ correct
  });

  res.json({ message: "Job deleted" });
};

exports.matchJob = async (req, res) => {
  try {
    const { resumeId, jobSkills = [] } = req.body;
    
    if (!jobSkills.length) {
      return res.status(400).json({ error: "jobSkills array is required and cannot be empty" });
    }

    if (!resumeId) {
      return res.status(400).json({ error: "resumeId is required" });
    }

    // Fetch the resume to get the parsed skills
    const Resume = require("../models/Resume");
    const resume = await Resume.findOne({ _id: resumeId, user: req.user });
    
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const userSkills = resume.parsedData?.skills || [];

    const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());
    const normalizedJobSkills = jobSkills.map(s => s.toLowerCase().trim());

    const matchedSkills = normalizedJobSkills.filter(skill => normalizedUserSkills.includes(skill));
    const missingSkills = normalizedJobSkills.filter(skill => !normalizedUserSkills.includes(skill));

    const matchPercentage = Math.round((matchedSkills.length / jobSkills.length) * 100);

    // Return missing skills in their original case
    const originalMissingSkills = jobSkills.filter(skill => 
      missingSkills.includes(skill.toLowerCase().trim())
    );

    res.json({
      matchPercentage,
      matchedSkills: userSkills.filter(s => matchedSkills.includes(s.toLowerCase().trim())),
      missingSkills: originalMissingSkills
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to match job" });
  }
};
