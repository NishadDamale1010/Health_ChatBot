// server.js
import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(express.static("public"));
app.use(bodyParser.json());

const responses = {
  "hello": "Hi there! 🤖 I’m your HealthBot, how can I help you?",
  "hi": "Hello! 👋 Tell me your symptoms or ask a health question.",
  "hey": "Hey! 😊 How can I assist you today?",

  "headache": "💊 Try resting in a quiet room and staying hydrated. If it persists, please consult a doctor.",
  "fever": "🌡️ Drink water, take rest, and monitor your temperature. If it’s high, seek medical advice.",
  "cold": "🤧 Stay warm, drink ginger tea or warm water, and get enough rest.",
  "cough": "🍯 Warm water with honey helps. If it lasts more than 7 days, consult a doctor.",
  "stomach ache": "🥗 Drink warm water and avoid oily food. If pain continues, please seek medical advice.",
  "diarrhea": "💧 Stay hydrated with ORS and light meals. If severe, see a doctor.",
  "stress": "🧘 Breathe deeply, take a short walk, or listen to calm music.",
  "sleep": "😴 Keep a regular sleep schedule and avoid screens 1 hour before bedtime.",
  "diet": "🥦 Eat balanced meals with veggies, fruits, protein, and stay hydrated.",
  "exercise": "🏃 30 minutes of daily activity boosts your mood and immunity.",
  "mental health": "💙 It’s important to talk to friends, family, or a counselor if you feel low.",
  "thanks": "You’re welcome! Stay healthy 💚",
  "bye": "Goodbye! Take care of your health 👋"
};


app.post("/chat", (req, res) => {
  const userMessage = req.body.message.toLowerCase();
  const reply = responses[userMessage] || "⚠️ Sorry, I don’t understand that yet. Try another health query!";
  res.json({ reply });
});

app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});
