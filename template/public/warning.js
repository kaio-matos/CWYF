function warning(message, error) {
  const warning_messages = document.querySelectorAll(".warning_message");
  let type = "danger";
  if (message) type = "success";
  if (error) type = "danger";

  warning_messages.forEach((w_m) => {
    w_m.innerHTML = `
    <div class="alert alert-${type} text-capitalize mt-3">
      ${message}
      ${error}
    </div>
    `;
  });
}
