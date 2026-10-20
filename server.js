const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "RAGE AI", configured: Boolean(process.env.GEMINI_API_KEY) });
});

app.post("/api/chat", async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message) return res.status(400).json({ error: "Type or say a message first." });
  if (message.length > 6000) return res.status(413).json({ error: "Message is too long. Keep it under 6,000 characters." });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "RAGE AI needs its AI key configured. Add GEMINI_API_KEY in your hosting service's Environment settings, then redeploy."
    });
  }

  const systemInstruction = [
    "You are RAGE AI, an energetic, bold, red-and-black gaming assistant.",
    "You are especially helpful with Roblox and Blox Fruits: builds, fruits, abilities, quests, grinding, trading, PvP combos, and beginner explanations.",
    "Be confident and playful, but never insult or threaten the user. Be honest when game information may have changed; do not invent update leaks, codes, stats, or patch notes.",
    "Give practical, easy-to-follow steps. For combos, state the weapon/style/fruit and the move order, and mention that timing or hitboxes can vary by update and device.",
    "For other Roblox games, help with tips and explain when you are uncertain. Do not claim to have live game access.",
    "Keep answers reasonably concise unless the user asks for detail. Match the user's language when possible.",
    "Never ask the user to reveal API keys, passwords, or private account details."
  ].join(" ");

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(apiKey),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: message }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 900 }
        }),
        signal: AbortSignal.timeout(30000)
      }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Gemini API returned status", response.status, data?.error?.message || "");
      return res.status(502).json({
        error: response.status === 400 || response.status === 403
          ? "The AI provider rejected the configured key or request. Check GEMINI_API_KEY in your hosting Environment settings."
          : "The AI provider is temporarily unavailable. Please try again."
      });
    }

    const answer = data?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("\n")
      .trim();

    if (!answer) return res.status(502).json({ error: "RAGE AI didn't receive a usable answer. Try again." });
    res.json({ answer });
  } catch (error) {
    console.error("Chat request failed:", error.message);
    res.status(504).json({ error: "RAGE AI timed out while connecting. Please try again." });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log("RAGE AI listening on port " + PORT));
