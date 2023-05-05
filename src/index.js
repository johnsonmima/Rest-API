const app = require("./app");
const port = process.env.PORT || 3000;

// listen
app.listen(port, () => {
  console.log(`server is listening at port ${port}`);
});
