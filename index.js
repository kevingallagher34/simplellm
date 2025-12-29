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

  const chatRes = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  const chatData = await chatRes.json();
  replyDiv.textContent = chatData.reply;

  // Call browser TTS instead of server
  speak(chatData.reply);
}


  function speak(text) {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis not supported in this browser.");
      return;
    }

    // Stop anything already speaking
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Gentle, natural defaults
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Optional: pick a nicer voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.toLowerCase().includes("natural") ||
      v.name.toLowerCase().includes("english")
    );
    if (preferred) utterance.voice = preferred;

    window.speechSynthesis.speak(utterance);
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


app.post("/speak", async (req, res) => {
  try {
    const { text } = req.body;

    const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel (default, good voice)

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2",
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.75
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length
    });

    res.send(audioBuffer);

  } catch (err) {
    console.error("ElevenLabs error:", err);
    res.status(500).json({ error: "TTS failed" });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
