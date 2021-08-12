const User = require("../models/User");
const { Message } = require("../models/Message");
const { tokenValidate } = require("./validateUser");

module.exports = {
  async checkUser(token) {
    try {
      const _id = tokenValidate(token);
      if (!_id) return;

      const user = await User.findOne({ _id });
      return user;
    } catch (err) {
      console.log(err);
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
      console.log(err);
      return undefined;
    }
  },

  async getAllMessages() {
    try {
      const allMessages = await Message.find({});
      return allMessages;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  },
};
