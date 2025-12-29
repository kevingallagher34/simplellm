const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const models = await genAI.listModels();
console.log(models);

const app = express();
app.use(express.json());

// This IS a constructor in this package
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
  res.send("simplellm with Gemini is running");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    


    const model = genAI.getGenerativeModel({
      model: "gemini-1.5"
    });

    const result = await model.generateContent(message);
    const text = result.response.text();

    res.json({ reply: text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
