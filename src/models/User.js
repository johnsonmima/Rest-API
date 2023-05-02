require("dotenv").config();
const mongoose = require("mongoose");
const validatorPackage = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./Task");

// schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) => validatorPackage.isEmail(value),
        message: "Please enter a valid email",
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      validate: {
        validator: (value) => !value.toLowerCase().includes("password"),
        message: "password cannot contain 'password'",
      },
    },
    tokens: [{ token: { type: String, required: true } }],
    // binary data
    avatar: { type: Buffer },
  },
  {
    timestamps: true,
    // delete password from the response
    // delete tokes from the response
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.tokens;
        delete ret.email;
        delete avatar;
        delete ret.updatedAt;
        delete ret.createdAt;
        delete ret.__v;
      },
    },
  }
);

// hash the password
userSchema.pre("save", async function (next) {
  const user = this;

  // check if the user has a modified password
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }

  next();
});

// instance of a user
// generate auth token
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const _id = user._id.toString();
  const token = jwt.sign({ _id }, process.env.JWT_SECRETE, {
    expiresIn: "7 days",
  });

  // add it to user arrays
  user.tokens = user.tokens.concat({ token });

  await user.save();
  return token;
};

// static methods to find user by email and password
userSchema.statics.findByCredentials = async (email, password) => {
  // find user
  const user = await User.findOne({ email });
  // if no user
  if (!user) {
    throw new Error("unable to login");
  }
  // compare password
  const isMatched = await bcrypt.compare(password, user.password);
  if (!isMatched) {
    throw new Error("unable to login");
  }

  return user;
};

// virtual attribute [ a way for mongoose to figure out how to model are related]
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

//delete user task if account is deleted
// or create a method on the user to remove task
userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

userSchema.methods.deleteAllTask = async function () {
  const user = this;
  await Task.deleteMany({ owner: user._id });
};

// model
const User = mongoose.model("User", userSchema);
module.exports = User;
