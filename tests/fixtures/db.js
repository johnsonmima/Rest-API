const jwt = require("jsonwebtoken");
const { Types } = require("mongoose");
const User = require("../../src/models/User");

// ids
const userOneID = new Types.ObjectId();
const userTwoID = new Types.ObjectId();
const userThreeID = new Types.ObjectId();

// create a default user with id and token
const userOne = {
  _id: userOneID,
  name: "Anna Mack",
  email: "test@gmail.com",
  password: "test123456",
  tokens: [{ token: jwt.sign({ _id: userOneID }, process.env.JWT_SECRETE) }],
};

const userTwo = {
  _id: userTwoID,
  name: "Andy Machine",
  email: "andy@gmail.com",
  password: "test123456",
  tokens: [{ token: jwt.sign({ _id: userTwoID }, process.env.JWT_SECRETE) }],
};

const userThree = {
  _id: userThreeID,
  name: "Red Bull",
  email: "red@gmail.com",
  password: "red123456",
  tokens: [{ token: jwt.sign({ _id: userThreeID }, process.env.JWT_SECRETE) }],
};
// user without id & token
const userFour = {
  name: "James One",
  email: "james@gmail.com",
  password: "james123456",
};

// configure data base
const configureDatabase = async () => {
  // clear the database
  await User.deleteMany();
  // create a two default test user
  await new User(userOne).save();
  await new User(userTwo).save();
};

module.exports = {
  User,
  configureDatabase,
  userOne,
  userTwo,
  userThree,
  userFour,
};
