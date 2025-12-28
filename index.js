const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("simplellm is running");
});

app.post("/chat", (req, res) => {
  const { message } = req.body;

  res.json({
    reply: `You said: ${message}`
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
