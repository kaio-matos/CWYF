const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { Message } = require("../models/Message");

module.exports = {
  async checkUser(token) {
    try {
      const { _id } = jwt.verify(token, process.env.TOKEN_JWT);
      const user = await User.findOne({ _id });
      return user;
    } catch (err) {
      return undefined;
    }
  },

  async storeMessage(message, email, name) {
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
  },

  async getAllMessages() {
    try {
      const allMessages = await Message.find({});
      return allMessages;
    } catch (err) {
      return undefined;
    }
  },
};
