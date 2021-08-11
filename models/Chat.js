const mongoose = require("mongoose");
const { message } = require("./Message");

// User characteristics
const chat = new mongoose.Schema({
  messages: { type: [message], default: [""] },
  participants: { type: [String], default: [""] },
});

// Collection Model
const Chat = mongoose.model("Chat", chat);

module.exports = Chat;
