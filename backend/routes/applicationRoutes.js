const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Application = require("../models/Application");

// save application
router.post("/", auth, async (req, res) => {
  try {
    const newApplication = new Application({
      ...req.body,
      user: req.user,
    });

    await newApplication.save();

    res.json({ message: "Application submitted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// ✅ get all applications of logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user });
    res.json(applications);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;