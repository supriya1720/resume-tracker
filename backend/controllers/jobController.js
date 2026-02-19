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

