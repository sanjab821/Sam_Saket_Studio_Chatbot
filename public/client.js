document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("userInput");
  const message = input.value;
  if (!message.trim()) return;

  showMessage("DU: " + message);
  input.value = "";

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  const data = await res.json();
  showMessage("NIKI: " + data.reply);
});

function showMessage(text) {
  const div = document.getElementById("chat");
  const p = document.createElement("p");
  p.textContent = text;
  div.appendChild(p);
}
