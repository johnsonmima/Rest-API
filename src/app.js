const express = require("express");
const app = express();
// db config
require("./config/db.config");
// express parse the request body to json
app.use(express.json());

// routes
app.use("/users", require("./routes/UserRoutes"));
app.use("/tasks", require("./routes/TaskRoutes"));

module.exports = app;
