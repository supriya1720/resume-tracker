const Task = require("../models/Task");

exports.addTask = async (req, res) => {

  const task = await Task.create({
    user: req.user,
    title: req.body.title,
    status: req.body.status,
    dueDate: req.body.dueDate
  });

  res.json(task);
};

exports.getTasks = async (req, res) => {
  const tasks = await Task.find({ user: req.user });
  res.json(tasks);
};
exports.deleteTask = async (req, res) => {
  await Task.findOneAndDelete({
    _id: req.params.id,
    user: req.user
  });

  res.json({ message: "Task deleted" });
};
exports.updateTaskStatus = async (req, res) => {

  const task = await Task.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user.id
    },
    {
      status: req.body.status
    },
    { new: true }
  );

  res.json(task);
};

exports.addSuggestedTasks = async (req, res) => {
  try {
    const { missingSkills } = req.body;

    if (!missingSkills || !Array.isArray(missingSkills)) {
      return res.status(400).json({ error: "missingSkills array is required" });
    }

    const tasksToCreate = missingSkills.map(skill => ({
      user: req.user,
      title: `Learn ${skill}`,
      status: "Pending"
    }));

    const createdTasks = await Task.insertMany(tasksToCreate);

    res.json(createdTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate tasks from skills" });
  }
};