# RAGE AI

A red-and-black, voice-first gaming assistant focused on Roblox and Blox Fruits.

## Features

- Responsive chat interface with a central voice-mode button
- Browser speech recognition for voice input (browser and microphone permission required)
- Spoken replies with browser text-to-speech
- Roblox and Blox Fruits-focused AI instructions
- Server-side Gemini API integration; the API key is never sent to the browser
- Health endpoint at `/api/health`

## Run locally

Requires Node.js 18 or newer.

```sh
npm install
```

Set the `GEMINI_API_KEY` environment variable in your terminal or in a local, uncommitted `.env` file using your preferred environment loader. Then run:

```sh
npm start
```

Open http://localhost:3000.

## Deploy on Render

1. Sign in to Render and create a new **Web Service** connected to this public GitHub repository.
2. Runtime: **Node**.
3. Build command: `npm install`.
4. Start command: `npm start`.
5. Add an Environment Variable named `GEMINI_API_KEY` and paste your key value into Render's secret environment field.
6. Deploy and open the generated service URL.

Get a Gemini API key from Google AI Studio. Never paste the key into chat, source code, a public repository, or the browser.

## Voice notes

Voice input uses the browser's SpeechRecognition API when supported. It usually works best in a secure HTTPS page with microphone permission. If voice input is unavailable, type into the chat box. Spoken replies use the browser's speech synthesis.

## Troubleshooting

- **"AI key not configured":** Add `GEMINI_API_KEY` to the hosting service's Environment settings and redeploy.
- **Provider rejects the key:** Verify the key in the provider console and confirm API access is enabled.
- **Voice does not work:** Open the website in a browser that supports speech recognition, allow microphone permission, and test the typed chat first.
- **Not Found:** Ensure the service is deployed from this repository and that the start command is `npm start`.

RAGE AI is an independent fan-made assistant, not affiliated with Roblox or the Blox Fruits developers.
