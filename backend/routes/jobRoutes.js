const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { addJob, getJobs, deleteJob } = require("../controllers/jobController");


router.post("/", auth, addJob);
router.get("/", auth, getJobs);
router.delete("/:id", auth, deleteJob);


module.exports = router;
