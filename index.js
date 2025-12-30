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
  // Step 1: declare a global array to hold voices
  let loadedVoices = [];

  // Step 2: populate it when browser voices are ready
  window.speechSynthesis.onvoiceschanged = () => {
    loadedVoices = window.speechSynthesis.getVoices();
    console.log("Loaded voices:", loadedVoices.map(v => v.name));
  };

  // Step 3: send function
  async function send() {
    const message = document.getElementById("message").value;
    const replyDiv = document.getElementById("reply");
    replyDiv.textContent = "Thinking...";

    try {
      const chatRes = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      if (!chatRes.ok) throw new Error(`HTTP ${chatRes.status}`);

      const chatData = await chatRes.json();
      replyDiv.textContent = chatData.reply;

      speak(chatData.reply);
    } catch (err) {
      console.error("Chat request failed:", err);
      replyDiv.textContent = "Error: " + err.message;
    }
  }

  // Step 4: speak function
  function speak(text) {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // use loaded voices
    const preferred = loadedVoices.find(v =>
      v.name.toLowerCase().includes("natural") ||
      v.name.toLowerCase().includes("english")
    );
    utterance.voice = loadedVoices.find(v =>
  v.name.toLowerCase().includes("natural") ||
  v.name.toLowerCase().includes("english")
) || loadedVoices[0] || null;
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});