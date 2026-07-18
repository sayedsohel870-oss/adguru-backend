const Anthropic = require("@anthropic-ai/sdk");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get("/", (req, res) => {
  res.json({ status: "AdGuru AI Backend is running!" });
});

app.post("/generate", async (req, res) => {
  const { product, budget, goal, location, industry, platforms } = req.body;

  if (!product) {
    return res.status(400).json({ error: "Product description required" });
  }

  const system = `You are an expert Indian digital marketing strategist. Generate a complete ad campaign for the Indian market.
Respond ONLY with a raw valid JSON object. No markdown. No code fences. Start with { and end with }.

JSON structure:
{"strategy":{"primary_platform":"string","estimated_reach":"string","expected_leads":"string","expected_roas":"string","best_time":"string","content_format":"string","unique_angle":"string"},"targeting":{"age":"string","gender":"string","interests":["5 real Meta interest categories"],"behaviors":["3 behaviors"],"exclude":["2 exclusions"],"lookalike":"string"},"competitors":[{"name":"real Indian brand","their_angle":"string","weakness":"string","counter_strategy":"string"},{"name":"string","their_angle":"string","weakness":"string","counter_strategy":"string"},{"name":"string","their_angle":"string","weakness":"string","counter_strategy":"string"}],"ad_copies":[{"platform":"Meta Feed","headline":"Hinglish headline","body":"2-3 line Hinglish body","cta":"string"},{"platform":"Instagram Reel","headline":"3-second hook","body":"full reel script","cta":"string"},{"platform":"WhatsApp","headline":"string","body":"conversational message","cta":"string"}],"image_prompts":[{"type":"Static Ad Image","prompt":"detailed Indian market Midjourney prompt"},{"type":"Reel Thumbnail","prompt":"detailed prompt"}],"budget_split":{"meta":35,"instagram":30,"youtube":15,"google":15,"testing":5},"action_plan":["Day 1-3: action","Week 1: action","Week 2: action","Month 1 review: action"]}`;

  const userMsg = `Product: ${product}
Budget: Rs ${budget}/month
Goal: ${goal}
Location: ${location}
Industry: ${industry}
Platforms: ${platforms}

Generate hyper-specific Indian ad campaign. Real Indian competitor names. Exact Meta interest categories. Hinglish copy that converts.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      system: system,
      messages: [{ role: "user", content: userMsg }],
    });

    const raw = message.content[0].text;
    const i0 = raw.indexOf("{");
    const i1 = raw.lastIndexOf("}");
    const json = JSON.parse(raw.substring(i0, i1 + 1));
    res.json({ success: true, data: json });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Generation failed. Try again." });
  }
});
app.use(express.static('.'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AdGuru backend running on port ${PORT}`));
