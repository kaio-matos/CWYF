function warning(message, error) {
  const warning_message = document.querySelector(".warning_message");
  let type = "danger";
  if (message) type = "success";
  if (error) type = "danger";

  warning_message.innerHTML = `
    <div class="alert alert-${type} text-capitalize mt-3">
      ${message}
      ${error}
    </div>
    `;
}
