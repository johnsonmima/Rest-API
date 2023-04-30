const mongoose = require("mongoose");

// schema
const taskSchema = new mongoose.Schema(
  {
    description: { type: String, trim: true, required: true },
    completed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// model
module.exports = mongoose.model("Task", taskSchema);
