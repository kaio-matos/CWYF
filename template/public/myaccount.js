const socket = io(window.location.href);
const form_addNewFriend = document.forms["form_addNewFriend"];

window.onload = () => {
  getUserData();
};

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
        <button style="width: fit-content;" class="delete_friend btn btn-danger mx-1">&#10005;</button>
        <button style="width: fit-content;" class="start_chat btn btn-primary mx-1">&#8594;</button>
        <hr class="mt-2" />
    </li>
    `;
  });

  const delete_friend = document.querySelectorAll(".delete_friend");
  delete_friend.forEach((btndel) =>
    btndel.addEventListener("click", deleteFriend)
  );
}

function addNewFriend(e) {
  e.preventDefault();
  const friendEmail = form_addNewFriend["friendEmail"].value;
  const storage_token = localStorage.getItem("storage_token");

  socket.emit("add_friend", { friendEmail: friendEmail, token: storage_token });
}

function deleteFriend(e) {
  const li = e.target.parentElement;
  const email = li.children[1].children[1].innerText;
  const storage_token = localStorage.getItem("storage_token");
  if (!storage_token) return;

  socket.emit("delete_friend", { friendEmail: email, token: storage_token });
}

form_addNewFriend.addEventListener("submit", addNewFriend);
socket.on("friend_loaded", getUserData);
socket.on("friend_deleted", getUserData);
socket.on("error", (error) => {
  warning("", error);
});
