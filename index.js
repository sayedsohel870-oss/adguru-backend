const express = require("express");
const cors = require("cors");
const path = require("path");
const fetch = require("node-fetch");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

app.get("/health", (req, res) => {
  res.json({ status: "AdGuru AI Backend is running!" });
});

app.post("/generate", async (req, res) => {
  const { product, budget, goal, location, industry, platforms } = req.body;
  if (!product) return res.status(400).json({ error: "Product required" });

  const prompt = `You are an expert Indian digital marketing strategist. Generate a complete ad campaign for the Indian market.
Respond ONLY with a raw valid JSON object. No markdown. No code fences. No extra text. Start directly with { and end with }.

Product: ${product}
Budget: Rs ${budget}/month
Goal: ${goal}
Location: ${location}
Industry: ${industry}
Platforms: ${platforms}

JSON:
{"strategy":{"primary_platform":"string","estimated_reach":"string","expected_leads":"string","expected_roas":"string","best_time":"string","content_format":"string","unique_angle":"string"},"targeting":{"age":"string","gender":"string","interests":["interest1","interest2","interest3","interest4","interest5"],"behaviors":["b1","b2","b3"],"exclude":["e1","e2"],"lookalike":"string"},"competitors":[{"name":"real Indian brand","their_angle":"string","weakness":"string","counter_strategy":"string"},{"name":"string","their_angle":"string","weakness":"string","counter_strategy":"string"},{"name":"string","their_angle":"string","weakness":"string","counter_strategy":"string"}],"ad_copies":[{"platform":"Meta Feed","headline":"Hinglish headline","body":"2-3 line body","cta":"string"},{"platform":"Instagram Reel","headline":"hook","body":"script","cta":"string"},{"platform":"WhatsApp","headline":"string","body":"message","cta":"string"}],"image_prompts":[{"type":"Static Ad Image","prompt":"detailed prompt"},{"type":"Reel Thumbnail","prompt":"detailed prompt"}],"budget_split":{"meta":35,"instagram":30,"youtube":15,"google":15,"testing":5},"action_plan":["Day 1-3: action","Week 1: action","Week 2: action","Month 1: action"]}`;

  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    console.log("API Key exists:", !!apiKey);
    
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
      })
    });

    const data = await response.json();
    console.log("Gemini status:", response.status);
    console.log("Gemini response keys:", Object.keys(data));

    if (data.error) {
      console.log("Gemini error:", JSON.stringify(data.error));
      return res.status(500).json({ error: data.error.message });
    }

    if (!data.candidates || !data.candidates[0]) {
      console.log("No candidates:", JSON.stringify(data));
      return res.status(500).json({ error: "No response from AI" });
    }

    const raw = data.candidates[0].content.parts[0].text;
    console.log("Raw response length:", raw.length);
    
    const i0 = raw.indexOf("{");
    const i1 = raw.lastIndexOf("}");
    
    if (i0 === -1 || i1 === -1) {
      console.log("No JSON found in:", raw.substring(0, 200));
      return res.status(500).json({ error: "Invalid AI response format" });
    }
    
    const json = JSON.parse(raw.substring(i0, i1 + 1));
    res.json({ success: true, data: json });
    
  } catch (err) {
    console.log("Catch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AdGuru backend running on port ${PORT}`));
