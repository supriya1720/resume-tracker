const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { addJob, getJobs, deleteJob, matchJob } = require("../controllers/jobController");


router.post("/", auth, addJob);
router.post("/match-job", auth, matchJob);
router.get("/", auth, getJobs);
router.delete("/:id", auth, deleteJob);


module.exports = router;
