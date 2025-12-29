const express = require("express");
const { GoogleGenerativeAI } = require("@google/genai");

const app = express();
app.use(express.json());

// Create client (NO `new`)
const genAI = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.get("/", (req, res) => {
  res.send("simplellm with Gemini is running");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const result = await model.generateContent(message);
    const text = result.response.text();

    res.json({ reply: text });

  } catch (err) {
    console.error("Gemini request failed:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
