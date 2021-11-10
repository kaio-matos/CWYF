const mongoose = require("mongoose");

// User characteristics
const message = new mongoose.Schema({
  name: { type: String, required: true },
  message: { type: String, required: true, minlength: 1 },
  email: { type: String, required: true, minlength: 3 },
  date: { type: Date, default: Date.now },
});

// Collection Model
const Message = mongoose.model("Message", message);

module.exports = { Message, message };
