const Chat = require("../models/Chat");
const User = require("../models/User");
const { tokenValidate } = require("./validateUser");

module.exports = {
  async getPrivateChat(friendEmail, token) {
    if (friendEmail === "") return { error: "Something goes wrong" };
    const _id = tokenValidate(token);
    if (!_id) return { error: "Please Login" };

    try {
      const USER = await User.findOne({ _id });

      const friend = USER.friends.filter((friend) => {
        return friend.email === friendEmail;
      });

      const _chatID = friend[0]._chatID;
      const CHAT = await Chat.findOne({ _id: _chatID });

      return { CHAT };
    } catch (error) {
      console.log(error);
    }
  },
  async storePrivateMessage(msg, chatID, token) {
    if (chatID === "") return { error: "Something goes wrong" };
    const _id = tokenValidate(token);
    if (!_id) return { error: "Please Login" };

    try {
      const USER = await User.findOne({ _id });

      const updatedChat = await Chat.updateOne(
        { _id: chatID },
        {
          $push: {
            messages: {
              name: USER.name,
              message: msg,
              email: USER.email,
            },
          },
        }
      );
      const CHAT = await Chat.findOne({ _id: chatID });

      return { CHAT };
    } catch (error) {
      return error;
    }
  },
};
