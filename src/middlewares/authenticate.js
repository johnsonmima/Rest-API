// authenticate
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    // check if token is present
    if (!authorization) {
      throw new Error();
    }
    //const token = authorization.split(" ")[1];
    const token = authorization.replace("Bearer", "").trim();
    // validate token
    const decoded = jwt.verify(token, process.env.JWT_SECRETE);
    const _id = decoded._id;
    // check if the token exist in the database
    const user = await User.findOne({ _id, "tokens.token": token });
    // if cant find user
    if (!user) {
      throw new Error();
    }
    // set user variable to current user
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token " });
  }
};

module.exports = authenticate;
