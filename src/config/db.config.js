require("dotenv").config();
const mongoose = require("mongoose");

// uri
const uri =
  "mongodb+srv://" +
  process.env.MONGO_DB_USERNAME +
  ":" +
  process.env.MONGO_DB_PASSWORD +
  "@task.cjnyztg.mongodb.net/?retryWrites=true&w=majority";

// options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true, //  build indexes
  //   maxPoolSize: 10, // Maintain up to 10 socket connections
  //   serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  //   socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  //   family: 4, // Use IPv4, skip trying IPv6
};

mongoose
  .connect(uri, options)
  .then(() => console.log("connected to Mongo Atlas"))
  .catch((error) => console.log(error));
