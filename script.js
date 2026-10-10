(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const moodButtons = [...document.querySelectorAll(".mood-choice")];
  const timeSelect = $("#timeSelect");
  const placeSelect = $("#placeSelect");
  const generateBtn = $("#generateBtn");
  const resultSection = $("#resultSection");
  const settingsDialog = $("#settingsDialog");
  const settingsStatus = $("#settingsStatus");

  let selectedMood = "calm";
  let lastMissionKey = "";
  let aiSettings = {
    url: localStorage.getItem("tg_ollama_url") || "http://localhost:11434",
    model: localStorage.getItem("tg_ollama_model") || "llama3.2"
  };

  const placeNames = {
    anywhere: "Anywhere nearby",
    garden: "Garden or plants",
    park: "Park or green space",
    street: "Street or neighbourhood",
    home: "Balcony or doorstep"
  };

  const missions = {
    calm: [
      { title: "Take a noticing walk", icon: "🍃", category: "A SMALL RESET", description: "Step outside and let your attention land on the world around you, one detail at a time.", steps: ["Leave your phone in your pocket or on silent.", "Notice one colour, one sound, and one texture.", "Take three unhurried breaths before heading back."] },
      { title: "Find your quiet corner", icon: "🌳", category: "SLOW DOWN", description: "Find a comfortable spot outdoors and give yourself a few minutes with no task to complete.", steps: ["Choose a safe place to sit or stand.", "Look at the sky, leaves, or clouds for a minute.", "Ask yourself: what can wait until later?"] },
      { title: "Listen to the outside", icon: "🐦", category: "SENSE CHECK", description: "Let the outdoor soundscape replace the noise in your head for a little while.", steps: ["Stand somewhere safe away from traffic.", "Identify two different sounds without naming their source straight away.", "Notice how the sounds change when you stay still."] }
    ],
    energy: [
      { title: "Walk one song's length", icon: "👟", category: "GENTLE MOVEMENT", description: "Head out for a brisk, comfortable walk. No pace goals and no need to track anything.", steps: ["Pick a familiar, safe route.", "Walk at a pace that feels good for you.", "Slow down for the final minute and notice how you feel."] },
      { title: "Take the scenic detour", icon: "🌤️", category: "MOVE A LITTLE", description: "Choose a slightly different path on a familiar route and see what you discover.", steps: ["Stay in a safe, familiar area.", "Take one new turn or walk along a different side of the block.", "Spot one detail you had not noticed before."] },
      { title: "Stretch in the open air", icon: "🌱", category: "FRESH-AIR BREAK", description: "Give your body a gentle reset outside, at a pace and range that feels comfortable.", steps: ["Find a stable, comfortable spot.", "Roll your shoulders and gently stretch your arms.", "Take a few easy steps and head back whenever you want."] }
    ],
    curious: [
      { title: "Become a tiny nature detective", icon: "🔎", category: "NOTICE MORE", description: "Look closely at the small details that make your neighbourhood unique.", steps: ["Find a leaf, a seed, a cloud, or a patch of moss.", "Notice its shape, colour, and pattern without picking it.", "Think of one question you would like to learn about it."] },
      { title: "Collect five colours", icon: "🎨", category: "A COLOUR HUNT", description: "Turn an ordinary walk into a tiny visual scavenger hunt.", steps: ["Choose five colours to look for.", "Find each colour in plants, buildings, signs, or the sky.", "Notice which colour was easiest and which surprised you."] },
      { title: "Watch a tiny ecosystem", icon: "🪴", category: "CURIOUS OUTSIDE", description: "Spend a few minutes observing how a small patch of nature changes and moves.", steps: ["Choose a plant or tree without disturbing it.", "Look for movement, patterns, or visitors from a respectful distance.", "Leave the spot as you found it."] }
    ],
    social: [
      { title: "Invite someone for a mini-walk", icon: "☀️", category: "A LITTLE CONNECTION", description: "Make connection easy: no big plan, just a short walk and a simple conversation.", steps: ["Ask a friend or family member if they are free for a few minutes.", "Walk somewhere public and comfortable for both of you.", "Ask what has been the best part of their week so far."] },
      { title: "Share a small discovery", icon: "🌼", category: "NOTICE TOGETHER", description: "Bring someone into the moment by finding one interesting detail outdoors.", steps: ["Choose a safe nearby outdoor spot together.", "Each find one detail the other might miss.", "Share what caught your attention and enjoy the small moment."] },
      { title: "Say hello to your neighbourhood", icon: "🏡", category: "COMMUNITY MOMENT", description: "Feel a little more connected to the place you live, one small moment at a time.", steps: ["Take a short walk along a familiar route.", "Offer a friendly greeting if it feels natural and safe.", "Notice one place or detail that makes your area feel like yours."] }
    ]
  };

  function chooseMission(mood, minutes, place) {
    let options = missions[mood] || missions.calm;
    const key = `${mood}-${minutes}-${place}`;
    if (key === lastMissionKey && options.length > 1) {
      options = options.filter((mission) => mission.title !== $("#resultTitle").textContent);
    }
    lastMissionKey = key;
    let mission = options[Math.floor(Math.random() * options.length)];
    mission = { ...mission, steps: [...mission.steps] };

    if (place === "garden") {
      mission.title = mood === "curious" ? "Inspect a tiny garden detail" : "Spend a moment with a plant";
      mission.icon = "🪴";
      mission.steps[0] = "Find a plant or garden area you can observe without disturbing it.";
    } else if (place === "park") {
      mission.steps[0] = "Head to a nearby park or green space you can access safely.";
    } else if (place === "street") {
      mission.steps[0] = "Choose a familiar, well-lit route with safe pedestrian space.";
    } else if (place === "home") {
      mission.title = mood === "energy" ? "Take a doorstep reset" : "Notice the world from your doorstep";
      mission.icon = "🌿";
      mission.steps[0] = "Step onto your balcony, doorstep, or another safe outdoor spot.";
    }

    const duration = Number(minutes);
    if (duration <= 5) {
      mission.steps = mission.steps.slice(0, 2);
      mission.steps.push("Finish by naming one thing you are glad you noticed.");
    } else if (duration >= 30) {
      mission.steps.push("If you feel like it, keep exploring at your own pace—there is no need to rush.");
    }
    return mission;
  }

  function renderMission(mission, minutes, place, source) {
    $("#resultIcon").textContent = mission.icon || "🌱";
    $("#resultCategory").textContent = mission.category || "YOUR OUTSIDE MISSION";
    $("#resultTitle").textContent = mission.title;
    $("#resultDescription").textContent = mission.description;
    $("#resultTime").textContent = `${minutes} min`;
    $("#resultPlace").textContent = placeNames[place] || placeNames.anywhere;
    const steps = $("#resultSteps");
    steps.replaceChildren();
    (mission.steps || []).slice(0, 5).forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step;
      steps.appendChild(li);
    });
    $("#aiBadge").innerHTML = `<span class="status-dot"></span> ${source === "ollama" ? "OPEN AI · LOCAL MODEL" : "LOCAL PLAN"}`;
    $("#doneMessage").classList.add("hidden");
    $("#doneBtn").disabled = false;
    $("#doneBtn").innerHTML = 'I did it <span>✓</span>';
    resultSection.classList.remove("hidden");
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function safeJsonParse(text) {
    const cleaned = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    try { return JSON.parse(cleaned); } catch (_) {
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start >= 0 && end > start) {
        try { return JSON.parse(cleaned.slice(start, end + 1)); } catch (_) {}
      }
    }
    return null;
  }

  async function askLocalModel(mood, minutes, place) {
    const baseUrl = aiSettings.url.replace(/\/+$/, "");
    const prompt = `Create one safe, realistic outdoor micro-adventure. Return ONLY valid JSON with keys title, icon (one emoji), category (2-4 words uppercase), description (one sentence), steps (array of exactly 3 short strings). Mood: ${mood}. Time available: ${minutes} minutes. Setting: ${placeNames[place]}. Avoid dangerous locations, buying items, disturbing wildlife, picking plants, or requiring internet. Keep it beginner-friendly.`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);
    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: aiSettings.model, prompt, stream: false, format: "json", options: { temperature: 0.8 } }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`Ollama returned HTTP ${response.status}`);
      const data = await response.json();
      const mission = safeJsonParse(data.response || "");
      if (!mission || !mission.title || !Array.isArray(mission.steps)) throw new Error("The model did not return the expected JSON.");
      return mission;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function generateMission() {
    const mood = selectedMood;
    const minutes = timeSelect.value;
    const place = placeSelect.value;
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span>Finding your mission…</span><span class="button-arrow">✳</span>';
    try {
      let mission;
      let source = "local";
      try {
        mission = await askLocalModel(mood, minutes, place);
        source = "ollama";
      } catch (error) {
        // A local template fallback keeps the app useful without an AI server.
        mission = chooseMission(mood, minutes, place);
        if (error.name !== "AbortError") console.info("Using built-in mission library:", error.message);
      }
      renderMission(mission, minutes, place, source);
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = '<span>Find my outside mission</span><span class="button-arrow">↗</span>';
    }
  }

  moodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      moodButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("selected", active);
        item.setAttribute("aria-pressed", String(active));
      });
      selectedMood = button.dataset.mood;
    });
  });

  generateBtn.addEventListener("click", generateMission);
  $("#anotherBtn").addEventListener("click", generateMission);
  $("#doneBtn").addEventListener("click", () => {
    $("#doneMessage").classList.remove("hidden");
    $("#doneBtn").disabled = true;
    $("#doneBtn").textContent = "Mission complete ✓";
  });

  function loadSettingsIntoDialog() {
    $("#ollamaUrl").value = aiSettings.url;
    $("#modelName").value = aiSettings.model;
    settingsStatus.textContent = "AI is optional. Your local plan generator works without it.";
    settingsDialog.showModal();
  }
  $("#settingsBtn").addEventListener("click", loadSettingsIntoDialog);
  $("#saveSettingsBtn").addEventListener("click", () => {
    const url = $("#ollamaUrl").value.trim().replace(/\/+$/, "");
    const model = $("#modelName").value.trim();
    if (!url || !model) {
      settingsStatus.textContent = "Please enter both the Ollama address and a model name.";
      return;
    }
    aiSettings = { url, model };
    localStorage.setItem("tg_ollama_url", url);
    localStorage.setItem("tg_ollama_model", model);
    settingsStatus.textContent = "Settings saved in this browser.";
    settingsDialog.close();
  });
  $("#testAiBtn").addEventListener("click", async () => {
    const url = $("#ollamaUrl").value.trim().replace(/\/+$/, "");
    settingsStatus.textContent = "Checking local Ollama connection…";
    try {
      const response = await fetch(`${url}/api/tags`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const names = (data.models || []).map((model) => model.name);
      const chosen = $("#modelName").value.trim();
      if (names.length && !names.some((name) => name === chosen || name.startsWith(`${chosen}:`))) {
        settingsStatus.textContent = `Connected, but "${chosen}" was not found. Available models: ${names.join(", ")}.`;
      } else {
        settingsStatus.textContent = `Connected successfully${names.length ? `. Models found: ${names.join(", ")}` : ""}.`;
      }
    } catch (error) {
      settingsStatus.textContent = "Could not connect. Start Ollama and check local CORS settings. The built-in mission library still works.";
    }
  });

  // Restore default mood accessibility state and apply saved settings.
  moodButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.mood === selectedMood)));
  $("#ollamaUrl").value = aiSettings.url;
  $("#modelName").value = aiSettings.model;
})();
