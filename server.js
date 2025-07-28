const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check route (optional)
app.get("/", (req, res) => {
  res.send("✅ PTO backend is running.");
});

app.post("/generate-plan", async (req, res) => {
  const { country, startDate, ptoDays, daysOff, vacationStart, vacationEnd } = req.body;

  // Validate required fields
  if (!country || !startDate || !ptoDays || !Array.isArray(daysOff)) {
    return res.status(400).json({ error: "Missing or invalid required fields." });
  }

  const prompt = `
You are a vacation planning assistant. Based on the info below, suggest how the user can best use their PTO to get long weekends and maximize time off in 2025.

Details:
- Country: ${country}
- Start Date: ${startDate}
- PTO Days Remaining: ${ptoDays}
- Existing Days Off: ${daysOff.join(", ") || "none"}
- Planned Vacations: ${vacationStart || "none"} to ${vacationEnd || "none"}

Give a friendly summary and then recommend specific dates to take off if possible.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const message = completion.choices?.[0]?.message?.content;

    if (!message) {
      throw new Error("Empty response from OpenAI");
    }

    res.json({ result: message });
  } catch (error) {
    console.error("❌ OpenAI error:", error);
    res.status(500).json({ error: "Failed to generate plan. Please try again." });
  }
});

// Dynamic port for Render deployment
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
