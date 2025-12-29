const express = require("express");
const { GoogleGenerativeAI } = require("@google/genai"); 

const app = express();
app.use(express.json());

// Load the Gemini API key from env
const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
  res.send("simplellm with Gemini is running");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Create a Gemini model (e.g., gemini‑1.5‑flash for fast responses)
    const model = geminiClient.getGenerativeModel({
      model: "gemini‑1.5‑flash"
    });

    // Send the user message as a prompt
    const result = await model.generateContent(message);
    
    // Extract generated text
    const aiText = result.response.text();

    res.json({ reply: aiText });

  } catch (err) {
    console.error("Gemini request failed:", err);
    res.status(500).json({ error: "Gemini API error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
