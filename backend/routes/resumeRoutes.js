const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  uploadResume,
  getResumes,
  deleteResume
} = require("../controllers/resumeController");

router.post("/", auth, upload.single("resume"), uploadResume);
router.get("/", auth, getResumes);
router.delete("/:id", auth, deleteResume);

module.exports = router;