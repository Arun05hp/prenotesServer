require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const user = require("./routes/user");
const feedback = require("./routes/feedback");
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/user", user);
app.use("/prenotes", feedback);
app.get("/", (req, res) => {
  res.send("Welcome");
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on Port ${port}...`));
