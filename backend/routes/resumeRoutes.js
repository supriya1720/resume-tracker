const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { uploadResume, getResumes, deleteResume } = require("../controllers/resumeController");



router.post("/", auth, uploadResume);
router.get("/", auth, getResumes);
router.delete("/:id", auth, deleteResume);


module.exports = router;
