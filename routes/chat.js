const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const translate = require('../services/translate');

// Chat endpoint
router.post('/', async (req, res) => {
  try {
    let { message, lang } = req.body;

    // Step 1: Translate user query to English
    let translatedMsg = await translate.toEnglish(message, lang);

    // Step 2: Send query to AI (Python API)
    let aiResponse = await aiService.getAIResponse(translatedMsg);

    // Step 3: Translate response back to user language
    let finalResponse = await translate.toLang(aiResponse, lang);

    res.json({ reply: finalResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
