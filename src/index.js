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
const contacts = require("./routes/contacts");
const { messages, storeMsg } = require("./routes/messages");
const feedback = require("./routes/feedback");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/user", user);
app.use("/upload", upload);
app.use("/exam", exampaper);
app.use("/notification", notification);
app.use("/contacts", contacts);
app.use("/messages", messages);
app.use("/prenotes", feedback);
app.use("/assets", express.static("assets"));
app.get("/", (req, res) => {
  res.send("Welcome");
});

io.on("connection", (socket) => {
  const id = socket.handshake.query.id;
  socket.join(id);
  socket.on("send-message", ({ sender, recipient, text, roomId }) => {
    socket.broadcast.to(recipient).emit("receive-message", {
      sender: id,
      text: text,
    });
    storeMsg(sender, text, roomId);
  });
});

server.listen(port, () => console.log(`Listening on Port ${port}...`));
