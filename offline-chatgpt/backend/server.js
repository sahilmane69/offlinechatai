const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  if (req.body.message === "ping") {
    return res.json({ reply: "pong ping" });
  }

  let finalPrompt = req.body.message;
  if (req.body.userName) {
    finalPrompt = `The user's name is ${req.body.userName}. Address them by their name when responding. User says: ${req.body.message}`;
  }

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "phi3",
      prompt: finalPrompt,
      stream: false
    })
  });

  const data = await response.json();

  res.json({
    reply: data.response
  });

});

app.listen(3000, () => {
  console.log("AI backend running on port 3000");
});