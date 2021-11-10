require("dotenv").config();

const express = require("express");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const userRouter = require("./routes/userRouter");
const routes = require("./routes/routes");
const {
  storeMessage,
  getAllMessages,
  checkUser,
} = require("./controllers/messageController");
const {
  addNewFriend,
  deleteFriend,
} = require("./controllers/friendController");
const {
  getPrivateChat,
  storePrivateMessage,
} = require("./controllers/privateMessageController");

mongoose.connect(
  process.env.MONGO_CONNECTION_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (error) => {
    if (error) console.log(error);
    else console.log("Mongo Connected");
  }
);

app.use("/", express.static(path.join(__dirname, "template/public")));
app.set("views", path.join(__dirname, "template"));
app.set("view engine", "ejs");

app.use("/", routes);
app.use("/", userRouter);

const server = app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
  console.log(`http://localhost:${process.env.PORT}`);
});

const io = socketIO(server);

io.of("/room").on("connection", async (socket) => {
  const messages = await getAllMessages();
  if (!messages) {
    return socket.emit("error", {
      userError: false,
      messageError: false,
      allMessagesError: true,
    });
  }

  socket.emit("server_messages", messages);

  // Receive message from front
  socket.on("client_message", async ({ msg, token }) => {
    // Checks user
    const user = await checkUser(token);
    if (!user) {
      return socket.emit("error", {
        userError: true,
        messageError: false,
        allMessagesError: false,
      });
    }

    // Put message on collection
    const message = await storeMessage(msg, user.email, user.name);
    if (!message) {
      return socket.emit("error", {
        userError: false,
        messageError: true,
        allMessagesError: false,
      });
    }

    // Get all messages
    const allMessages = await getAllMessages();
    if (!allMessages) {
      return socket.emit("error", {
        userError: false,
        messageError: true,
        allMessagesError: true,
      });
    }

    io.of("/room").emit("server_messages", allMessages);
  });
});

io.of("/myaccount").on("connection", async (socket) => {
  socket.on("add_friend", async ({ friendEmail, token }) => {
    const result = await addNewFriend(friendEmail, token);
    if (result.error) {
      return socket.emit("error", result.error);
    }
    if (result.message) {
      socket.emit("friend_loaded", result);
      return socket.emit("message", result.message);
    }
  });

  socket.on("delete_friend", async ({ friendEmail, token }) => {
    const result = await deleteFriend(friendEmail, token);
    if (result.error) {
      return socket.emit("error", result.error);
    }
    if (result.message) {
      socket.emit("friend_deleted", result);
      return socket.emit("message", result.message);
    }
  });

  socket.on("private_chat", async ({ friendEmail, token }) => {
    const result = await getPrivateChat(friendEmail, token);
    if (result.error) {
      return socket.emit("error", result.error);
    }
    if (result.CHAT) {
      socket.join("chatID: " + result.CHAT._id);
      return socket.emit("update_chat", result.CHAT);
    }
  });

  socket.on("private_message", async ({ socketID, chatID, msg, token }) => {
    const result = await storePrivateMessage(msg, chatID, token);
    if (result.error) {
      return socket.emit("error", result.error);
    }
    if (result.CHAT) {
      socket.to("chatID: " + result.CHAT._id).emit("update_chat", result.CHAT);
      return socket.emit("update_chat", result.CHAT);
    }
  });
});
