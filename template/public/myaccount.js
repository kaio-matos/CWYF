const socket = io(window.location.href);
const form_addNewFriend = document.forms["form_addNewFriend"];
const form_message = document.querySelector("#form_message");
form_message.addEventListener("submit", getPrivateMessageAndSend);

window.onload = () => {
  getUserData();
};

/**
 *
 *
 *
 * Renders
 *
 */

function renderUserData(name, email) {
  const userData = document.querySelector("#userData");
  userData.children[0].innerHTML = name;
  userData.children[1].innerHTML = email;
}

function renderUserFriends(friends) {
  if (!friends) return;
  const userFriends = document.querySelector("#userFriends");
  userFriends.innerHTML = "";
  friends.forEach((friend) => {
    userFriends.innerHTML += `
    <li style="max-width: 100%;" class="row">
        <hr class="mb-2" />
        <span class="col d-flex flex-column justify-content-center">
          <b>${friend.name}</b>
          <span>${friend.email}</span>
        </span>
        <div class="col-sm d-flex justify-content-sm-end">
          <button style="width: fit-content;" class="delete_friend btn btn-danger mx-1 ">&#10005;</button>
          <button style="width: fit-content;" class="start_chat btn btn-primary mx-1 ">&#8594;</button>
        </div>
        <hr class="mt-2" />
    </li>
    `;
  });

  const delete_friend = document.querySelectorAll(".delete_friend");
  const start_chat = document.querySelectorAll(".start_chat");
  delete_friend.forEach((btndel) =>
    btndel.addEventListener("click", deleteFriend)
  );
  start_chat.forEach((btnchat) =>
    btnchat.addEventListener("click", chatWithFriend)
  );
}

function renderMessages(messages) {
  const message_container = document.querySelector("#message_container");
  const storage_email = localStorage.getItem("storage_email");
  message_container.innerHTML = "";

  messages.forEach((msg) => {
    if (msg.email == storage_email) {
      message_container.innerHTML += `
        <div style="width: fit-content" class=" d-flex align-items-center flex-wrap gap-1 border border-primary rounded bg-primary bg-opacity-25 my-2 py-3 ps-2 pe-5">
          <b>${msg.name}</b>
          <span>${msg.message}</span>
        </div>
    `;
    } else {
      message_container.innerHTML += `
        <div style="width: fit-content" class=" d-flex align-items-center flex-wrap gap-1 border border-primary rounded bg-secondary bg-opacity-25 my-2 py-3 ps-2 pe-5">
          <b>${msg.name}</b>
          <span>${msg.message}</span>
        </div>
      `;
    }
  });

  // Set scroll down
  const message_scroller = document.querySelector("#message_scroller");
  message_scroller.scrollTop = message_scroller.scrollHeight;
}

function renderFriendData(friendName, friendEmail) {
  const friend_data = document.querySelector("#friend_data");
  friend_data.children[0].innerText = friendName;
  friend_data.children[1].innerText = friendEmail;
}

/**
 *
 *
 *
 * Get initial data
 *
 */
async function getUserData() {
  const url = window.location.href;

  const storage_token = localStorage.getItem("storage_token");

  const fetchResponse = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ token: storage_token }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await fetchResponse.json();

  renderUserData(data.name, data.email);
  renderUserFriends(data.friends);
}

/**
 *
 *
 *
 * Friend action
 *
 */

function addNewFriend(e) {
  e.preventDefault();
  const friendEmail = form_addNewFriend["friendEmail"].value;
  const storage_token = localStorage.getItem("storage_token");

  socket.emit("add_friend", { friendEmail: friendEmail, token: storage_token });
}
socket.on("friend_loaded", getUserData);

function deleteFriend(e) {
  const li = e.target.parentElement.parentElement;
  const span = li.children[1];
  const email = span.children[1].innerText;

  const storage_token = localStorage.getItem("storage_token");
  if (!storage_token) return;

  socket.emit("delete_friend", { friendEmail: email, token: storage_token });
}
socket.on("friend_deleted", () => {
  getUserData();
  renderMessages([]);
});
form_addNewFriend.addEventListener("submit", addNewFriend);

/**
 *
 *
 *
 * Chat
 *
 */

function chatWithFriend(e) {
  const li = e.target.parentElement.parentElement;
  const span = li.children[1];

  const friendName = span.children[0].innerText;
  const friendEmail = span.children[1].innerText;
  renderFriendData(friendName, friendEmail);

  const storage_token = localStorage.getItem("storage_token");
  if (!storage_token) return;

  socket.emit("private_chat", { friendEmail, token: storage_token });
}

function getPrivateMessageAndSend(e) {
  e.preventDefault();
  const message = form_message["message"].value;
  const friend_data = document.querySelector("#friend_data");
  if (message === "") return;
  if (friend_data.children[0].innerText === "Select a friend to chat")
    return warning("", "Select a friend first");

  sendPrivateMessage(message);
  form_message["message"].value = "";
  form_message["message"].focus();
}

function sendPrivateMessage(msg) {
  const storage_token = localStorage.getItem("storage_token");
  const storage_chatID = localStorage.getItem("storage_chatID");

  if (!storage_token) return warning("", "Please login");
  if (!storage_chatID) return warning("", "Please select a friend");

  socket.emit("private_message", {
    socketID: socket.id,
    chatID: storage_chatID,
    msg,
    token: storage_token,
  });
}

socket.on("update_chat", (chat) => {
  renderMessages(chat.messages);
  const chatID = chat._id;

  localStorage.setItem("storage_chatID", chatID);
});

/**
 *
 *
 *
 * Errors
 *
 */
socket.on("error", (error) => {
  warning("", error);
});
socket.on("message", (message) => {
  warning(message, "");
});
