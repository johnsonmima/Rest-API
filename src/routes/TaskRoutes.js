const express = require("express");
const Task = require("../models/Task");
const authenticate = require("../middlewares/authenticate");

const route = express.Router();

// delete task
route.delete("/:id", authenticate, async (req, res) => {
  const _id = req.params.id;
  try {
    // get ID
    if (!_id) {
      return res.status(400).json({ error: "ID is missing" });
    }

    const task = await Task.findByIdAndDelete({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).json({});
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json(error);
  }
});

// update task
route.patch("/:id", authenticate, async (req, res) => {
  const _id = req.params.id;

  // what users are allowed to update
  const update = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
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
    const task = await Task.findById({ _id, owner: req.user._id });

    // if no user
    if (!task) {
      return res.status(404).send();
    }

    update.forEach((update) => (task[update] = req.body[update]));

    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET  /tasks
// GET /tasks?completed=true
// GET /tasks?limit=10&page=1
// GET /tasks?limit=10&page=1&sortBy=createdAt:asc
route.get("/", authenticate, async (req, res) => {
  // properties
  let requestLimit = 2;
  let requestPage = 1;
  let requestSortBy = { createdAt: 1 };
  let isValidSortField = false;
  // const
  const allowSortByFields = ["createdAt", "completed"];
  const { completed, limit, page, sortBy } = req.query;

  try {
    // match
    const match = { owner: req.user._id };

    // limiting the request
    if (completed) {
      match["completed"] = completed === "true";
    }
    // pagination
    if (limit) {
      requestLimit = parseInt(limit);
    }
    if (page) {
      requestPage = parseInt(page);
    }
    // sorting  
    if (sortBy) {
      // check if its valid
      const sortQueryVal = sortBy.split(":");
      const [sortKey, sortVal] = sortQueryVal;
      // make sure sort field is valid
      isValidSortField = allowSortByFields.includes(sortKey);

      if (isValidSortField) {
        requestSortBy[sortKey] = sortVal === "asc" ? 1 : -1;
      }
    }
    // get the tasks
    const tasks = await Task.find(match)
      .sort(requestSortBy)
      .limit(requestLimit * 1)
      .skip((requestPage - 1) * requestLimit);
    // get document count
    const count = await Task.countDocuments();

    if (!tasks) {
      res.status(404).json([]);
    }

    res.status(200).json({
      tasks,
      totalPages: Math.ceil(count / requestLimit),
      currentPage: requestPage,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// relationship
// find by id
route.get("/:id", authenticate, async (req, res) => {
  // get id
  const _id = req.params.id;
  if (_id === null) {
    return res.status(404).json({ error: { message: "Task ID is missing" } });
  }

  try {
    const task = await Task.findById({ _id }).populate("owner").exec();
    // use ref and populate to create a relationship

    if (!task) {
      return res.status(404).json(null);
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json(error);
  }
});

// create new Task
route.post("/", authenticate, async (req, res) => {
  try {
    // new task
    const task = new Task({ ...req.body, owner: req.user._id });
    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = route;
