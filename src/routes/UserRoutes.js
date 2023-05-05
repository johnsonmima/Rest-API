const path = require("path");
const express = require("express");
const User = require("../models/User");
const authenticate = require("../middlewares/authenticate");
// file upload & cropping
const multer = require("multer");
const sharp = require("sharp");

const route = express.Router();

// login in user
route.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // find user by a custom static method
    const user = await User.findByCredentials(email, password);
    // generateAuthToken
    const token = await user.generateAuthToken();
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: "unable to log in" });
  }
});

// create new user
route.post("/signup", async (req, res) => {
  const { name, password, email } = req.body;

  try {
    const user = new User({ name, password, email });
    const token = await user.generateAuthToken();
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json(error);
  }
});

// logout current account
route.post("/logout", authenticate, async (req, res) => {
  try {
    // removing token
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

route.post("/logoutAll", authenticate, async (req, res) => {
  try {
    // removing token
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

// delete another user
route.delete("/:id", authenticate, async (req, res) => {
  try {
    const _id = req.params.id;
    const user = await User.findByIdAndDelete({ _id });
    // delete all task
    await user.deleteAllTask();

    if (!user) {
      return res.status(404).json(null);
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

// update
route.patch("/:id", authenticate, async (req, res) => {
  // what users are allowed to update
  const update = Object.keys(req.body);
  const allowedUpdates = ["email", "name", "password"];
  const isValidOperation = update.every((update) =>
    allowedUpdates.includes(update)
  );

  // check if its valid
  if (!isValidOperation) {
    return res.status(400).json({ error: "Invalid updates" });
  }

  try {
    const { id } = req.params;
    // options set new = true to return the new user
    const user = await User.findById({ _id: id });

    // if no user
    if (!user) {
      return res.status(404).send();
    }

    update.forEach((update) => (user[update] = req.body[update]));

    // save
    await user.save();

    // const user = await User.findByIdAndUpdate({ _id }, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get my profile
route.get("/me", authenticate, async (req, res) => {
  const { name, _id, email, createdAt } = req.user;
  res.status(200).json({ name, _id, email, createdAt });
});

// get all users
route.get("/", authenticate, async (req, res) => {
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
route.get("/:id", authenticate, async (req, res) => {
  const _id = req.params.id;

  if (_id === null) {
    return res.status(404).json({ error: { message: "User ID is missing" } });
  }

  try {
    const user = await User.findById({ _id });

    if (!user) {
      return res.status(404).json(null);
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});
// Avatar Upload
// Save as Buffer

//dest
const profileImageDestination = "public/avatar";
// disk storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, profileImageDestination);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const newFilename = req.user._id + "-" + uniqueSuffix + ".png";
//     cb(null, newFilename);
//   },
// });
// memory storage
//const storage = multer.memoryStorage();
// upload
const upload = multer({
  fileFilter(req, file, cb) {
    if (file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      cb(undefined, true);
    } else {
      return cb(Error("Please enter either a .png, .jpg, or .jpeg file"));
    }
  },
  limits: { fileSize: 1000000 },
}).single("avatar");
//const upload = multer({ dest: profileImageDestination });

// file upload with multer
route.post("/upload", authenticate, async (req, res) => {
  // req.file is the name of your file in the form above, here 'upload'
  // req.body will hold the text fields, if there were any
  // handle error
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(400).json({ error: err.message });
    }

    try {
      const { buffer } = req.file;
      // resize the image with sharp
      const resizedBuffer = await sharp(buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer();

      // update the user profile
      req.user.avatar = resizedBuffer;
      await req.user.save();
      res.status(200).send();
    } catch (error) {
      res
        .status(500)
        .json({ error: "an unknown error occurred when uploading." });
    }
  });
});

// DELETE /users/me/avatar
route.delete("/me/avatar", authenticate, async (req, res) => {
  try {
    // set avatar field to undefined
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).json();
  } catch (error) {
    res
      .status(500)
      .json({ error: "an unknown error occurred when uploading." });
  }
});

// GET /users/:id/avatar
route.get("/:id/avatar", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    // set the header
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

// cropping images

module.exports = route;
