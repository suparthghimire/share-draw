const express = require("express");
const http = require("http");
const path = require("path");
const expHbs = require("express-handlebars");
const socketio = require("socket.io");
// server codes
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server Running on port ${PORT}`));

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.engine(
  "hbs",
  expHbs({
    extname: "hbs",
  })
);
app.set("view engine", ".hbs");

// view engine

// routers
app.use("/", require("./routes/index"));
app.use("/drawpad", require("./routes/drawpad"));
// socket io codes
const io = socketio(server);
const {
  userJoin,
  userLeave,
  getCurrentUser,
  getAllUsers,
} = require("./utils/user_helper");
const formatMsg = require("./utils/chat_helper");
const cons = require("consolidate");

io.on("connection", (socket) => {
  socket.on("joinUsers", ({ uname, room }) => {
    const user = userJoin(socket.id, uname, room);
    socket.join(user.room);
    console.log(formatMsg(user.username, "Abc"));
    socket.broadcast
      .to(user.room)
      .emit("userRoomMsg", `${user.username} has Joined`);
    io.to(user.room).emit("allUsers", { users: getAllUsers(user.room) });
  });

  console.log("User Connected");

  socket.on("mousedown", ({ x, y }) => {
    console.log(`Mouse Down on ${x}, ${y}`);
    socket.broadcast.emit("mousedown", { x, y });
  });

  socket.on("pencilDraw", ({ x, y }) => {
    console.log(`Mouse Move on ${x}, ${y}`);
    socket.broadcast.emit("pencilDraw", { x, y });
  });

  socket.on("mouseup", ({ x, y }) => {
    console.log(`Mouse Up on ${x}, ${y}`);
    socket.broadcast.emit("mouseup", { x, y });
  });

  socket.on("chatMessage", (message) => {
    const user = getCurrentUser(socket.id);
    const username = user.username;
    io.to(user.room).emit("chatMessage", { username, message });
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.emit("userRoomMsg", `${user.username} has Left`);
    }
  });
});
