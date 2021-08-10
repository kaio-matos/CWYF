require("dotenv").config();

const express = require("express");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const path = require("path");
const jwt = require("jsonwebtoken");

const app = express();
const userRouter = require("./routes/userRouter");
const routes = require("./routes/routes");
const User = require("./models/User");
const Message = require("./models/Message");

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

async function checkUser(token) {
  try {
    const { _id } = jwt.verify(token, process.env.TOKEN_JWT);
    const user = await User.findOne({ _id });
    return user;
  } catch (err) {
    return undefined;
  }
}

async function storeMessage(message, email, name) {
  const newMessage = new Message({
    message,
    email,
    name,
  });

  try {
    const savedMessage = await newMessage.save();
    return savedMessage;
  } catch (error) {
    return undefined;
  }
}

async function getAllMessages() {
  try {
    const allMessages = await Message.find({});
    return allMessages;
  } catch (err) {
    return undefined;
  }
}
