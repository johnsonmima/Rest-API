const mongoose = require("mongoose");

// schema
const taskSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "User",
    },
    description: { type: String, trim: true, required: true },
    completed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// model
module.exports = mongoose.model("Task", taskSchema);
