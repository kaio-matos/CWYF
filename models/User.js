const mongoose = require("mongoose");

// User characteristics
const user = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3 },
  email: { type: String, required: true, minlength: 3 },
  friends: {
    type: [
      {
        name: { type: String, required: true, minlength: 3 },
        email: { type: String, required: true, minlength: 3 },
        _chatID: String,
      },
    ],
    default: [],
  },
  password: { type: String, required: true, minlength: 6 },
});

// Collection Model
const User = mongoose.model("User", user);

module.exports = User;
