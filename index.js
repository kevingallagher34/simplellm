const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Pick a model
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash', // fast + cheap
  // model: 'gemini-1.5-pro', // smarter, slower
});

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const result = await model.generateContent(message);
    const response = result.response;

    // Gemini response extraction
    const reply = response.text();

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gemini API error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
