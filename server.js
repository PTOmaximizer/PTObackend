const express = require("express");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/generate-plan", async (req, res) => {
  const data = req.body;

  const prompt = `
You are a vacation planning assistant. Based on the info below, suggest how the user can best use their PTO to get long weekends and maximize time off in 2025.

Details:
- Country: ${data.country}
- Start Date: ${data.startDate}
- PTO Hours Remaining: ${data.ptoDays}
- Existing Days Off: ${data.daysOff.join(", ") || "none"}
- Planned Vacations: ${data.vacationStart || "none"} to ${data.vacationEnd || "none"}

Give a friendly summary and then recommend specific dates to take off if possible.
  `;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ result: completion.data.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
