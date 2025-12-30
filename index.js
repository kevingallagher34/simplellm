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
  body { font-family: sans-serif; padding: 1rem; }
  #chat-container { max-width: 500px; margin: auto; }
  input, button { font-size: 1rem; padding: 0.5rem; width: 100%; margin-top: 0.5rem; }
  #reply { margin-top: 1rem; }
</style>

<div id="chat-container">
  <input id="message" placeholder="Say something..." />
  <button onclick="send()">Send</button>
  <div id="reply"></div>
</div>


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
  const voices = window.speechSynthesis.getVoices();
utterance.voice = voices[0] || null; // fallback to first available voice

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

/*
app.post("/speak", async (req, res) => {
  try {
    const { text } = req.body;
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
    speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";

    const audioConfig = sdk.AudioConfig.fromAudioOutputStream(
      sdk.PullAudioOutputStream.createPullStream()
    );

    const synthesizer = new sdk.SpeechSynthesizer(
      speechConfig,
      audioConfig
    );

    synthesizer.speakTextAsync(
      text,
      result => {
        synthesizer.close();
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          const audioBuffer = Buffer.from(result.audioData);
          res.set("Content-Type", "audio/mpeg");
          res.send(audioBuffer);
        } else {
          console.error("Speech synthesis failed:", result.errorDetails);
          res.status(500).json({ error: "TTS failed" });
        }
      },
      err => {
        synthesizer.close();
        console.error("Azure TTS error:", err);
        res.status(500).json({ error: "TTS error" });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
*/



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
