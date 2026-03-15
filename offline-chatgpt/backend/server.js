require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  console.log("Received chat request:", req.body);
  const { message, userName } = req.body;

  if (message === "ping") {
    return res.json({ reply: "pong" });
  }

  const userGreeting = userName ? `The user's name is ${userName}. Address them by their name when responding.` : "";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: `You are Saiman AI, a helpful and premium AI assistant. ${userGreeting}` 
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    console.log("Groq response received status:", response.status);
    
    if (!response.ok) {
      console.error("Groq API Error Detail:", data);
      return res.status(500).json({ reply: `API Error: ${data.error?.message || "Unknown error"}` });
    }

    const reply = data.choices[0].message.content;
    console.log("Sending reply back to user");
    res.json({ reply });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ reply: "Error processing your request" });
  }
});

app.listen(PORT, () => {
  console.log(`AI backend running on port ${PORT}`);
});