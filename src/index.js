require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 5000;
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const user = require("./routes/user");
const upload = require("./routes/uploads");
const exampaper = require("./routes/exampaper");
const notification = require("./routes/notification");
const feedback = require("./routes/feedback");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/user", user);
app.use("/upload", upload);
app.use("/exam", exampaper);
app.use("/notification", notification);
app.use("/prenotes", feedback);
app.use("/assets", express.static("assets"));
app.get("/", (req, res) => {
  res.send("Welcome");
});

io.on("connection", (socket) => {
  const id = socket.handshake.query.id;
  console.log("id", id);
  socket.join(id);

  socket.on("send-message", ({ recipients, text }) => {
    recipients.forEach((recipient) => {
      const newRecipients = recipients.filter((r) => r !== recipient);
      newRecipients.push(id);
      socket.broadcast.to(recipient).emit("receive-message", {
        recipients: newRecipients,
        sender: id,
        text,
      });
    });
  });
});

server.listen(port, () => console.log(`Listening on Port ${port}...`));
