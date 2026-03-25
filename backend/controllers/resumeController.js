const Resume = require("../models/Resume");

exports.uploadResume = async (req, res) => {

  const resume = await Resume.create({
    user: req.user,
    file: req.file.filename
  });

  res.json(resume);
};

exports.getResumes = async (req, res) => {

  const resumes = await Resume.find({ user: req.user });
  res.json(resumes);

};

exports.deleteResume = async (req, res) => {

  await Resume.findOneAndDelete({
    _id: req.params.id,
    user: req.user
  });

  res.json({ message: "Resume deleted" });
};