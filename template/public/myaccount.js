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

getUserData();

function renderUserData(name, email) {
  const userData = document.querySelector("#userData");
  userData.children[0].innerHTML = name;
  userData.children[1].innerHTML = email;
}

function renderUserFriends(friends) {
  const userFriends = document.querySelector("#userFriends");
  userFriends.innerHTML = "";
  friends.forEach((friend) => {
    userFriends.innerHTML += `
    <li class="row">
        <hr class="mb-2" />
        <span class="col d-flex justify-content-center align-items-center">
        ${friend.name}
        </span>
        <button class="col btn btn-primary">Talk</button>
        <hr class="mt-2" />
    </li>
    `;
  });
}
