socket = io(window.location.href);

const form_message = document.querySelector("#form_message");

form_message.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = form_message["message"].value;
  sendMessage(message);
  form_message["message"].value = "";
  form_message["message"].focus();
});

socket.on("server_messages", (messages) => {
  renderMessages(messages);

  // Set scroll down
  const message_container = document.querySelector("#message_container");
  message_container.scrollTop = message_container.scrollHeight;
});

function sendMessage(msg) {
  const storage_token = localStorage.getItem("storage_token");

  socket.emit("client_message", {
    msg,
    token: storage_token,
  });
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
}

socket.on("error", ({ allMessagesError, messageError, userError }) => {
  if (allMessagesError) {
    warning("", "Some error has happened, please reload the page");
  }
  if (messageError) {
    warning("", "Please write at least 1 letter");
  }
  if (userError) {
    warning("", "You're not logged in. Please log in");
  }
});
