// ✅ server.js
import express from "express";
import bodyParser from "body-parser";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";
import fs from "fs";
import axios from "axios";

// ✅ Load disease dataset (as a local fallback)
let diseaseData = [];
try {
  diseaseData = JSON.parse(fs.readFileSync("diseases.json", "utf-8"));
} catch (err) {
  console.warn("⚠️ Could not load diseases.json, disease lookup will be limited.");
}

// ✅ Express setup
const app = express();
app.use(express.static("public"));
app.use(bodyParser.json());

// ✅ Static responses
const responses = {
  "hello": "Hi there! 🤖 I’m your HealthBot, how can I help you?",
  "hi": "Hello! 👋 Tell me your symptoms or ask a health question.",
  "hey": "Hey! 😊 How can I assist you today?",
  "thank you": "You’re welcome! Stay healthy 💚",
  "thanks": "You’re welcome! Stay healthy 💚",
  "creator": "🌟 Hello! I'm proudly created by *Team Innovators* 🚀 to guide you in health matters.",
  "dhanyavaad": "🙌 Anytime! Main yahi hoon aapki madad ke liye. Swasth rahiye",
  "info": "I am HealthBot 🤖. I can provide basic health advice, symptom info, vaccination schedules, and outbreak updates. For serious issues, please consult a doctor.",
  "bye": "Goodbye! Take care of your health 👋"
};

// ✅ Helper functions

// Get symptoms of a disease from local data
function getSymptoms(disease) {
  if (!diseaseData || !diseaseData.length) {
    return "⚠️ Disease database not loaded. Please consult a doctor.";
  }
  const entry = diseaseData.find(d => d.name && d.name.toLowerCase() === disease.toLowerCase());
  if (entry) {
    return `Symptoms of ${entry.name}: ${entry.symptoms.join(", ")}. (Always confirm with doctor.)`;
  } else {
    return "⚠️ Sorry, I don't have info for this disease. Please consult a doctor for accurate advice.";
  }
}

// Vaccination schedule based on age
function getVaccinationSchedule(age) {
  let vaccines = [];
  if (age <= 1) vaccines = ["BCG", "Hepatitis B", "Polio"];
  else if (age <= 5) vaccines = ["MMR", "DPT booster"];
  else if (age <= 18) vaccines = ["Td booster", "HPV"];
  else vaccines = ["Annual Flu", "Td booster"];
  return `Recommended vaccines for age ${age} years: ${vaccines.join(", ")}`;
}

// Fetch COVID outbreak data (free API)
async function getCovidData(country = "India") {
  try {
    const res = await axios.get(`https://disease.sh/v3/covid-19/countries/${country}`);
    return `Latest COVID-19 cases today in ${country}: ${res.data.todayCases}`;
  } catch (error) {
    return "⚠️ Sorry, I couldn't fetch outbreak data right now.";
  }
}

// Fuzzy match disease
function findDisease(query) {
  if (!query) return null;
  query = query.toLowerCase().trim();
  if (!diseaseData) return null;

  // Exact match first
  let match = diseaseData.find(d => d.name && d.name.toLowerCase() === query);
  if (match) return match;

  // Partial match
  match = diseaseData.find(d => d.name && d.name.toLowerCase().includes(query));
  if (match) return match;

  // Word match
  match = diseaseData.find(d => d.name && d.name.toLowerCase().split(" ").some(word => query.includes(word)));
  return match || null;
}

// ✅ New helper function to query MedlinePlus Connect API
async function searchMedlinePlus(query) {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://connect.medlineplus.gov/service?mainSearchCriteria.v.cs=2.16.840.1.113883.6.96&mainSearchCriteria.v.c=${encodedQuery}&informationist.v=1.0&returnFormat=json`;

  try {
    const res = await axios.get(url);
    const results = res.data.concept;
    if (results && results.length > 0) {
      const firstResult = results[0];
      return `I found information on ${firstResult.title}: ${firstResult.fullUrl}. (Disclaimer: This information is for educational purposes only. Always consult a medical professional.)`;
    }
    return null; // Return null if no results
  } catch (error) {
    console.error("⚠️ Error fetching from MedlinePlus:", error.message);
    return null;
  }
}

// ✅ New helper function to query NHS API
async function searchNHS(query) {
  // NOTE: The NHS API requires a free API key.
  // You need to sign up for a key on the NHS Digital Developer Portal.
  // Replace 'YOUR_NHS_API_KEY' with your actual key.
  const NHS_API_KEY = 'YOUR_NHS_API_KEY';
  const encodedQuery = encodeURIComponent(query);
  const url = `https://api.nhs.uk/health-a-to-z/conditions/search?query=${encodedQuery}`;

  try {
    const res = await axios.get(url, {
      headers: {
        'subscription-key': NHS_API_KEY
      }
    });
    if (res.data.results && res.data.results.length > 0) {
      const firstResult = res.data.results[0];
      return `Found an article on "${firstResult.name}": ${firstResult.url}. (Source: NHS. Always consult a doctor.)`;
    }
    return null;
  } catch (error) {
    console.error("⚠️ Error fetching from NHS API:", error.message);
    return null;
  }
}

// ✅ Main reply function (with improved conversational logic)
async function getReply(message) {
  if (!message || typeof message !== "string") {
    return "⚠️ Sorry, I didn't receive a valid message. Please try again!";
  }

  const normalizedMessage = message.toLowerCase().trim();

  // 1. Check for static responses first (highest priority)
  for (let key in responses) {
    if (normalizedMessage.includes(key)) return responses[key];
  }

  // 2. Check for a disease directly in the message
  // This is the key change that fixes the "dengue" and "fever" problem.
  const words = normalizedMessage.split(/\s+/);
  for (let word of words) {
    const disease = findDisease(word);
    if (disease) {
      return getSymptoms(disease.name);
    }
  }

  // 3. Check for specific keywords for other functionalities
  // Vaccination query
  if (normalizedMessage.includes("vaccine") || normalizedMessage.includes("vaccination")) {
    const ageMatch = normalizedMessage.match(/\d+/);
    const age = ageMatch ? parseInt(ageMatch[0]) : 0;
    return getVaccinationSchedule(age);
  }

  // Outbreak query
  if (normalizedMessage.includes("outbreak") || normalizedMessage.includes("covid")) {
    return await getCovidData("India");
  }
  
  // 4. Fallback to external APIs for broad queries
  // This handles common terms like "cold," "fever," etc.
  const apiReply = await searchMedlinePlus(normalizedMessage);
  if (apiReply) {
    return apiReply;
  }

  // A secondary API fallback
  const nhsReply = await searchNHS(normalizedMessage);
  if (nhsReply) {
    return nhsReply;
  }

  // 5. If all else fails
  return "⚠️ Sorry, I couldn’t find information on that. Please try rephrasing your health query or consult a doctor.";
}

// ✅ Web chatbot route
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  const reply = await getReply(userMessage);
  res.json({ reply });
});

// ✅ Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Web server running at http://localhost:${PORT}`));

// ✅ WhatsApp bot setup
const client = new Client({
  authStrategy: new LocalAuth()
});

client.on("qr", (qr) => qrcode.generate(qr, { small: true }));

client.on("ready", () => console.log("✅ WhatsApp bot is ready!"));

client.on("message", async (message) => {
  const reply = await getReply(message.body);
  client.sendMessage(message.from, reply);
});

client.initialize();