document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("userInput");
  const message = input.value;
  input.value = "";

  const response = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();
  document.getElementById("chat").innerHTML += `
    <p><strong>Du:</strong> ${message}</p>
    <p><strong>Bot:</strong> ${data.reply}</p>
  `;
});
