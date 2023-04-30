const mongoose = require("mongoose");
const validatorPackage = require("validator");

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
  },
  {
    timestamps: true,
    // delete password from the response
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
      },
    },
  }
);

// model

module.exports = mongoose.model("User", userSchema);
