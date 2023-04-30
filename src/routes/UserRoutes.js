const express = require("express");
const User = require("../models/User");

const route = express.Router();

// delete
route.delete("/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    // get ID
    if (!_id) {
      return res.status(400).json({ error: "ID is missing" });
    }

    const user = await User.findByIdAndDelete({ _id });

    if (!user) {
      return res.status(404).json({});
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

// update
route.patch("/:id", async (req, res) => {
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

  // get ID
  if (!_id) {
    return res.status(400).json({ error: "ID is missing" });
  }

  try {
    // options set new = true to return the new user
    const user = await User.findByIdAndUpdate({ _id }, req.body, {
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

// get all users
route.get("/", async (req, res) => {
  try {
    const users = await User.find({});

    // if no users
    if (!users) {
      return res.status(404).json({});
    }

    // return data
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

// find by id
route.get("/:id", (req, res) => {
  const _id = req.params.id;

  if (_id === null) {
    return res.status(404).json({ error: { message: "User ID is missing" } });
  }

  User.findById(_id)
    .then((result) => res.status(200).json(result))
    .catch((error) => res.status(500).json(error));
});

// create new user
route.post("/", (req, res) => {
  const { name, password, email } = req.body;

  const user = new User({ name, password, email });

  user
    .save()
    .then((result) => res.status(201).json(result))
    .catch((error) => res.status(400).json(error.message));
});

module.exports = route;
