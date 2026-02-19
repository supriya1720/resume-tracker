const Task = require("../models/Task");

exports.addTask = async (req, res) => {
  const task = await Task.create({
    user: req.user,
    title: req.body.title
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
