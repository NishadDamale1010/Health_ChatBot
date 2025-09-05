async function sendMessage() {
  const input = document.getElementById('user-input');
  const msg = input.value;
  if (!msg) return;

  addMessage("You", msg);
  input.value = "";

  let response = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: msg, lang: "en" })
  });

  let data = await response.json();
  addMessage("Bot", data.reply);
}

function addMessage(sender, text) {
  const chatBox = document.getElementById('chat-box');
  const div = document.createElement('div');
  div.innerHTML = `<b>${sender}:</b> ${text}`;
  chatBox.appendChild(div);
}
