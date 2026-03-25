const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  title: String,

  status: {
    type: String,
    enum: ["Pending", "Completed"],
    default: "Pending"
  },

  dueDate: Date

});

module.exports = mongoose.model("Task", TaskSchema);