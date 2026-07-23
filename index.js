const express = require("express");
const cors = require("cors");
const path = require("path");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get("/health", (req, res) => {
  res.json({ status: "AdGuru AI Backend is running!" });
});

app.post("/generate", async (req, res) => {
  const { product, budget, goal, location, industry, platforms } = req.body;
  if (!product) return res.status(400).json({ error: "Product required" });

  const prompt = "You are an expert Indian digital marketing strategist. Generate a complete ad campaign for the Indian market. Respond ONLY with a raw valid JSON object. No markdown. No code fences. Start with { and end with }.\n\nProduct: " + product + "\nBudget: Rs " + budget + "/month\nGoal: " + goal + "\nLocation: " + location + "\nIndustry: " + industry + "\nPlatforms: " + platforms + '\n\nJSON:\n{"strategy":{"primary_platform":"string","estimated_reach":"string","expected_leads":"string","expected_roas":"string","best_time":"string","content_format":"string","unique_angle":"string"},"targeting":{"age":"string","gender":"string","interests":["i1","i2","i3","i4","i5"],"behaviors":["b1","b2","b3"],"exclude":["e1","e2"],"lookalike":"string"},"competitors":[{"name":"Indian brand","their_angle":"string","weakness":"string","counter_strategy":"string"},{"name":"string","their_angle":"string","weakness":"string","counter_strategy":"string"},{"name":"string","their_angle":"string","weakness":"string","counter_strategy":"string"}],"ad_copies":[{"platform":"Meta Feed","headline":"Hinglish headline","body":"2-3 line body","cta":"string"},{"platform":"Instagram Reel","headline":"hook","body":"script","cta":"string"},{"platform":"WhatsApp","headline":"string","body":"message","cta":"string"}],"image_prompts":[{"type":"Static Ad Image","prompt":"detailed prompt"},{"type":"Reel Thumbnail","prompt":"detailed prompt"}],"budget_split":{"meta":35,"instagram":30,"youtube":15,"google":15,"testing":5},"action_plan":["Day 1-3: action","Week 1: action","Week 2: action","Month 1: action"]}';

  try {
    var apiKey = process.env.GOOGLE_API_KEY;
    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

    var response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
      })
    });

    var data = await response.json();

    if (data.error) {
      console.log("Gemini error:", data.error.message);
      return res.status(500).json({ error: data.error.message });
    }

    if (!data.candidates || !data.candidates[0]) {
      console.log("No candidates:", JSON.stringify(data));
      return res.status(500).json({ error: "No AI response" });
    }

    var raw = data.candidates[0].content.parts[0].text;
    var i0 = raw.indexOf("{");
    var i1 = raw.lastIndexOf("}");
    var json = JSON.parse(raw.substring(i0, i1 + 1));
    res.json({ success: true, data: json });

  } catch (err) {
    console.log("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log("AdGuru backend running on port " + PORT);
});
