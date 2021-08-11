const Chat = require("../models/Chat");
const User = require("../models/User");
const { tokenValidate } = require("./validateUser");

module.exports = {
  async addNewFriend(friendEmail, token) {
    const _id = tokenValidate(token);
    if (!_id) return { error: "Please Login" };

    try {
      const USER = await User.findOne({ _id });

      // Checks if it's himself
      if (USER.email === friendEmail)
        return { error: "You can't add yourself" };

      // Checks if it's not repeating the same friend
      const isAlreadyFriend = checkAlreadyFriend(USER.friends, friendEmail);
      if (isAlreadyFriend) return { error: "He/She is already your friend" };

      const FRIEND = await User.findOne({ email: friendEmail });
      const chatID = await createChat(USER.email, FRIEND.email);

      const status = await updateBothAsNewFriends(USER, FRIEND, chatID);
      const updatedUser = await User.findOne({ _id });

      if (status.error !== "") return { error: status.error };
      else return updatedUser;
    } catch (error) {
      console.log(error);
    }
  },

  async deleteFriend(friendEmail, token) {
    const _id = tokenValidate(token);
    if (!_id) return { error: "Please Login" };
    try {
      const USER = await User.findOne({ _id });

      await User.updateOne(
        { _id },
        { $pull: { friends: { email: friendEmail } } }
      );
      await User.updateOne(
        { email: friendEmail },
        { $pull: { friends: { email: USER.email } } }
      );

      deleteChatID(USER.friends, friendEmail);
      return true;
    } catch (error) {
      console.log(error);
    }
  },
};

async function deleteChatID(friends, friendEmail) {
  const deletedFriend = friends.filter((friend) => {
    return friend.email === friendEmail;
  });
  const chat = Chat.findByIdAndDelete(deletedFriend._chatID);
}

async function createChat(userEmail, friendEmail) {
  try {
    const chat = new Chat({
      participants: [userEmail, friendEmail],
    });
    const savedChat = await chat.save();
    return chat._id;
  } catch (error) {
    return error;
  }
}

function checkAlreadyFriend(userFriends, friendEmail) {
  const equalFriends = userFriends.filter((friend) => {
    return friend.email === friendEmail;
  });

  if (equalFriends.length !== 0) return true;
  else return false;
}

async function updateBothAsNewFriends(user, friend, chatID) {
  const filteredUser = {
    name: user.name,
    email: user.email,
    _chatID: chatID,
  };

  const filteredFriend = {
    name: friend.name,
    email: friend.email,
    _chatID: chatID,
  };

  try {
    await User.updateOne(
      { _id: user._id },
      { $push: { friends: filteredFriend } }
    );

    await User.updateOne(
      { _id: friend._id },
      { $push: { friends: filteredUser } }
    );

    return { message: "New friend added", error: "" };
  } catch (error) {
    return { message: "", error: error };
  }
}
