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

  const prompt = "You are an expert Indian digital marketing strategist. Generate a complete ad campaign for the Indian market. Respond ONLY with a raw valid JSON object. No markdown. No code fences. Start with { and end with }.\n\nProduct: " + product + "\nBudget: Rs " + budget + "/month\nGoal: " + goal + "\nLocation: " + location + "\nIndustry: " + industry + "\nPlatforms: " + platforms + '\n\nReturn this exact JSON structure with real values:\n{"strategy":{"primary_platform":"Meta","estimated_reach":"50000-70000","expected_leads":"40-60","expected_roas":"3x-4x","best_time":"7-10 pm","content_format":"Reels + Images","unique_angle":"string"},"targeting":{"age":"18-35","gender":"Female","interests":["i1","i2","i3","i4","i5"],"behaviors":["b1","b2","b3"],"exclude":["e1","e2"],"lookalike":"string"},"competitors":[{"name":"Indian brand 1","their_angle":"string","weakness":"string","counter_strategy":"string"},{"name":"Indian brand 2","their_angle":"string","weakness":"string","counter_strategy":"string"},{"name":"Indian brand 3","their_angle":"string","weakness":"string","counter_strategy":"string"}],"ad_copies":[{"platform":"Meta Feed","headline":"Hinglish headline","body":"2-3 line body","cta":"Book Now"},{"platform":"Instagram Reel","headline":"hook line","body":"reel script","cta":"Book Now"},{"platform":"WhatsApp","headline":"greeting","body":"message","cta":"Reply Now"}],"image_prompts":[{"type":"Static Ad Image","prompt":"detailed prompt"},{"type":"Reel Thumbnail","prompt":"detailed prompt"}],"budget_split":{"meta":35,"instagram":30,"youtube":15,"google":15,"testing":5},"action_plan":["Day 1-3: action","Week 1: action","Week 2: action","Month 1: action"]}';

  try {
    var apiKey = process.env.GROQ_API_KEY;

    var response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an Indian digital marketing expert. Always respond with valid JSON only. No markdown, no code blocks, no extra text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    var data = await response.json();

    if (data.error) {
      console.log("Groq error:", JSON.stringify(data.error));
      return res.status(500).json({ error: data.error.message });
    }

    if (!data.choices || !data.choices[0]) {
      console.log("No choices:", JSON.stringify(data));
      return res.status(500).json({ error: "No AI response" });
    }

    var raw = data.choices[0].message.content;
    console.log("Raw response:", raw.substring(0, 100));

    var i0 = raw.indexOf("{");
    var i1 = raw.lastIndexOf("}");

    if (i0 === -1 || i1 === -1) {
      console.log("No JSON found");
      return res.status(500).json({ error: "Invalid response format" });
    }

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
