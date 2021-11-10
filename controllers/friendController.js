const Chat = require("../models/Chat");
const User = require("../models/User");
const { tokenValidate } = require("./validateUser");

module.exports = {
  async addNewFriend(friendEmail, token) {
    if (friendEmail === "")
      return { error: "Please write the email to add a new friend" };
    const _id = tokenValidate(token);
    if (!_id) return { error: "Please Login" };

    try {
      const USER = await User.findOne({ _id });

      // Checks if it's himself
      if (USER.email === friendEmail) return { error: "Are you kidding me?" };

      // Checks if it's not repeating the same friend
      const isAlreadyFriend = checkAlreadyFriend(USER.friends, friendEmail);
      if (isAlreadyFriend) return { error: "He/She is already your friend" };

      const FRIEND = await User.findOne({ email: friendEmail });
      if (!FRIEND) return { error: "Please enter a valid email" };
      const chatID = await createChat(USER.email, FRIEND.email);

      const status = await updateBothAsNewFriends(USER, FRIEND, chatID);
      await User.findOne({ _id });

      if (status.error !== "") return { error: status.error };
      else return { message: "Your friend has been added" };
    } catch (error) {
      return { error: error.message };
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

      await deleteChatID(USER.friends, friendEmail);
      return { message: "Your friend has been removed" };
    } catch (error) {
      return { error: error.message };
    }
  },
};

async function deleteChatID(friends, friendEmail) {
  const deletedFriend = friends.filter((friend) => {
    return friend.email === friendEmail;
  });

  try {
    await Chat.findByIdAndDelete({ _id: deletedFriend[0]._chatID });
  } catch (error) {
    return { error: "Something goes wrong" };
  }
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
