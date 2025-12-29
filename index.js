const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());

// This IS a constructor in this package
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>simplellm</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      max-width: 700px;
      margin: 40px auto;
      padding: 0 20px;
    }
    textarea {
      width: 100%;
      height: 100px;
      font-size: 16px;
    }
    button {
      margin-top: 10px;
      padding: 8px 16px;
      font-size: 16px;
    }
    .reply {
      margin-top: 20px;
      white-space: pre-wrap;
      background: #f5f5f5;
      padding: 12px;
      border-radius: 6px;
    }
  </style>
</head>
<body>
  <h1>simplellm</h1>

  <textarea id="message" placeholder="Say something..."></textarea><br/>
  <button onclick="send()">Send</button>

  <div id="reply" class="reply"></div>

  <script>
    async function send() {
      const message = document.getElementById("message").value;
      const replyDiv = document.getElementById("reply");
      replyDiv.textContent = "Thinking...";

      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      const data = await res.json();
      replyDiv.textContent = data.reply || JSON.stringify(data);
    }
  </script>
</body>
</html>
  `);
});


app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash" // <-- use this
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
