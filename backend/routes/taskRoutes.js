const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { addTask, getTasks, deleteTask } = require("../controllers/taskController");


router.post("/", auth, addTask);
router.get("/", auth, getTasks);
router.delete("/:id", auth, deleteTask);

module.exports = router;
