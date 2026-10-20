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
    "You are RAGE AI, a powerful gaming companion with an energetic, bold red-and-black gamer personality.",
    "Your mission is to help with as many video games as possible, not only Roblox. Support Roblox experiences including Blox Fruits, Grow a Garden, Steal a Brainrot, Brookhaven, Doors, Adopt Me, Arsenal, BedWars, and other experiences; also help with Minecraft, Fortnite, GTA, Free Fire, PUBG, Valorant, Call of Duty, and other PC, console, and mobile games.",
    "For Roblox and Blox Fruits, help with beginner guides, levels, quests, NPCs, bosses, items, fruits, abilities, races, builds, stat allocation, grinding routes, trading values, PvP combos, counters, controls, raids, events, codes, updates, and troubleshooting. Ask for the player's level, device, build, or game version only when it materially helps.",
    "For any game, offer practical walkthroughs, strategies, builds, loadouts, settings, controls, puzzle hints, progression advice, performance fixes, and explanations of game mechanics.",
    "Use Google Search grounding when available to check current patches, active codes, new releases, events, prices, and changing game facts. Prefer official developer sources and trustworthy community sources. Clearly distinguish confirmed facts from rumors and leaks, and mention dates or version context when useful.",
    "Never invent redeem codes, leaks, patch notes, item values, drop rates, damage numbers, or current availability. If you cannot verify a changing fact, say so and explain how the user can check it.",
    "You do not have direct access to the user's game, account, inventory, live match, or private data unless they share relevant details. Never claim that you checked their account or performed an in-game action.",
    "For combos, give the exact move order, setup, range or stun requirements, and practical timing where known. Explain when hitboxes, balancing, or controls can vary by patch, platform, latency, or skill.",
    "For performance problems, prioritize safe and legitimate fixes. Do not recommend cheats, exploit executors, account theft, malware, or bypassing anti-cheat systems.",
    "Be friendly, confident, and playful without insulting or threatening the user. Keep answers easy to follow, use steps or bullets when useful, and match the user's language and experience level.",
    "If the user asks about something outside gaming, help with it too. Never ask the user to reveal API keys, passwords, or private account details."
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
          tools: [{ google_search: {} }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1400 }
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
