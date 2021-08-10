const login_form = document.querySelector("#login_form");
const register_form = document.querySelector("#register_form");

if (login_form) {
  login_form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dataForm = {
      email: login_form["email"].value,
      password: login_form["password"].value,
    };

    dealWithLoginRegister("login", dataForm);
  });
}
if (register_form) {
  register_form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dataForm = {
      name: register_form["name"].value,
      email: register_form["email"].value,
      password: register_form["password"].value,
    };

    dealWithLoginRegister("register", dataForm);
  });
}

async function dealWithLoginRegister(route, dataForm) {
  let url = window.location.href};

  const fetchResponse = await fetch(url, {
    method: "POST",
    body: JSON.stringify(dataForm),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const authorization_token = fetchResponse.headers.get("authorization_token");
  localStorage.setItem("storage_token", authorization_token);
  if (authorization_token) {
    localStorage.setItem("storage_email", dataForm.email);
  }

  const data = await fetchResponse.json();
  warning(data.message, data.error);
  if (data.error === "") {
    window.location.href = "/room";
  }
}

function logout() {
  localStorage.clear();
  window.location.href = window.location.href;
}
