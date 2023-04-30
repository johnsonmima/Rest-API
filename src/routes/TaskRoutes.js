const express = require("express");
const Task = require("../models/Task");

const route = express.Router();

// delete task 
route.delete("/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    // get ID
    if (!_id) {
      return res.status(400).json({ error: "ID is missing" });
    }

    const task = await Task.findByIdAndDelete({ _id });

    if (!task) {
      return res.status(404).json({});
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json(error);
  }
});

// update task
route.patch("/:id", async (req, res) => {
  const _id = req.params.id;

  // what users are allowed to update
  const update = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password"];
  const isValidOperation = update.every((update) =>
    allowedUpdates.includes(update)
  );

  // check if its valid
  if (!isValidOperation) {
    return res.status(400).json({ error: "Invalid updates" });
  }

  if (!_id) {
    return res.status(400).json({ error: "ID is missing" });
  }

  try {
    // options set new = true to return the new user
    const user = await Task.findByIdAndUpdate({ _id }, req.body, {
      new: true,
      runValidators: true,
    });

    // if no user
    if (!user) {
      return res.status(404).send();
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get all task
route.get("/", (req, res) => {
  Task.find({})
    .then((result) => res.status(200).json(result))
    .catch((error) => res.status(500).json(error));
});

// find by id
route.get("/:id", (req, res) => {
  // get id
  const _id = req.params.id;
  if (_id === null) {
    return res.status(404).json({ error: { message: "Task ID is missing" } });
  }

  Task.findById(_id)
    .then((result) => res.status(200).json(result))
    .catch((error) => res.status(500).json(error));
});

// create new Task
route.post("/", (req, res) => {
  const { description, completed = false } = req.body;
  // new task
  const task = new Task({ description, completed });
  // save task
  task
    .save()
    .then((result) => res.status(201).json(result))
    .catch((error) => res.status(400).json(error.message));
});

module.exports = route;
