const express = require("express");
const app = express();
// db config
require("./config/db.config");

const port = process.env.PORT || 3000;
// express parse the request body to json
app.use(express.json());

// routes
app.use("/users", require("./routes/UserRoutes"));
app.use("/tasks", require("./routes/TaskRoutes"));

// listen
app.listen(port, () => {
  console.log(`server is listening at port ${port}`);
});
