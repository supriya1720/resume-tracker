const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Task = require("../models/Task"); // ✅ ADD THIS

const {
  addTask,
  getTasks,
  deleteTask,
  updateTaskStatus,
  addSuggestedTasks
} = require("../controllers/taskController");

router.post("/", auth, addTask);
router.post("/from-skills", auth, addSuggestedTasks);
router.get("/", auth, getTasks);
router.delete("/:id", auth, deleteTask);

router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(updatedTask);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;