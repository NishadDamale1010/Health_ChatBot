const axios = require('axios');

const AI_API_URL = "http://localhost:5000/predict"; // Python Flask API

async function getAIResponse(message) {
  try {
    const res = await axios.post(AI_API_URL, { query: message });
    return res.data.reply;
  } catch (err) {
    console.error("AI Service Error:", err.message);
    return "Sorry, AI service not available right now.";
  }
}

module.exports = { getAIResponse };
