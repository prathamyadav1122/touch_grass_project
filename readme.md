# Touch Grass 🌿

**An outdoor-mission companion powered by open AI when you want it—and useful even when you don't.**

Touch Grass turns a mood, a time window, and a nearby setting into a small, practical outdoor mission. The aim is to make the screen the shortest part of the experience: choose, step outside, and go.

## Files

- `index.html` — app structure and settings dialog
- `style.css` — responsive layout, colors, and illustrations
- `script.js` — mission logic, built-in fallback library, and optional local-model integration
- `readme.md` — setup and project notes

## Run it

1. Keep all four files in the same folder.
2. Open `index.html` in a modern browser.
3. Choose a mood, time, and setting, then select **Find my outside mission**.

The built-in mission library works without an AI server. The first-party interface uses no hosted AI API by default.

## Enable open-weight AI with Ollama

The app can ask a model served by [Ollama](https://ollama.com/) to create a fresh mission locally.

1. Install Ollama from the official website.
2. In a terminal, download a model, for example:

   ```bash
   ollama pull llama3.2
   ```

3. Start Ollama and make sure the model is available:

   ```bash
   ollama list
   ```

4. Serve the app from a local development server rather than opening the file directly. For example, if Python is installed, run this command in the project folder:

   ```bash
   python -m http.server 8000
   ```

   Then visit `http://localhost:8000`.

5. If the browser blocks requests to Ollama, enable local-origin access in Ollama's environment configuration. On Windows, the variable is commonly set before starting Ollama:

   ```powershell
   $env:OLLAMA_ORIGINS="http://localhost:8000"
   ollama serve
   ```

   If Ollama is already running in the background, quit it first and restart it from the terminal so it receives the environment variable. On macOS/Linux, set `OLLAMA_ORIGINS` for the Ollama process before starting it. Only allow origins you trust.

6. Open the gear icon in Touch Grass. Set the Ollama address to `http://localhost:11434` and model to `llama3.2`, then test the connection.

The app calls Ollama's local `/api/generate` endpoint. If the local model is unavailable, it automatically uses the built-in mission library instead.

> **Privacy note:** With Ollama configured, prompts are sent to the Ollama service on your own machine. The app does not send prompts to a third-party AI API. Browser requests to localhost may still be blocked until CORS is configured.

## Why open innovation matters

- **Local-first AI:** An open-weight model can run on a computer the user controls, so prompts do not need to go to a hosted AI provider.
- **Choice and control:** Users can swap the model in the settings rather than being locked to one closed model or provider.
- **Accessible fallback:** The built-in mission library keeps the experience usable when a model is not installed, offline, or unavailable.
- **Inspectable and adaptable:** The mission prompt and safety constraints are plain JavaScript that builders can inspect and change.
- **Low-friction purpose:** The app is intentionally designed around a short real-world activity, not a longer on-screen session.

## Design principles

- Small activities are valid; five minutes is enough.
- No streaks, guilt, leaderboards, or pressure.
- Keep activities beginner-friendly and avoid disturbing plants or wildlife.
- Prefer familiar, safe, accessible places.
- No account or location permission is required.

## Current limitations

- Ollama must be installed separately to use model-generated missions.
- Running a model locally still uses device resources and may not be practical on every laptop.
- The app does not currently use GPS, weather, or live trail data; choose a safe, familiar place.
- The fallback mission library is rule-based, not an AI model.

## Possible next steps

- Add a PWA service worker for more reliable offline use.
- Add optional, privacy-preserving local weather data.
- Add a post-walk reflection that stays in the browser.
- Test with people outdoors and refine missions based on their feedback.

---

Built for the **Touch Grass** challenge: open tools, real-world moments, and less time staring at the screen.
