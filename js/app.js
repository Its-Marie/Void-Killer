// The Void Killer - Main Orchestrator

import { initGamification, playerState, getLevelTitle, canPlaySound, savePlayerState, initSupabase, syncToSupabase, pullFromSupabase } from './gamification.js';
import { getApiKey, isOfflineMode, setApiKey } from './api.js';
import { initQuestsView } from './quests.js';
import { initLanguageView } from './language.js';
import { initAthleteView } from './athlete.js';
import { initQuizView } from './quiz.js';
import { initBestiaryView } from './bestiary.js';
import { initAchievementsView } from './achievements.js';

// Elements
const xpBar = document.getElementById("player-xp-bar");
const xpText = document.getElementById("player-xp-text");
const levelTitle = document.getElementById("player-level-title");
const streakRow = document.getElementById("streak-runes-row");
const offlineBanner = document.getElementById("offline-banner");
const focusToggleBtn = document.getElementById("focus-mode-toggle");
const lightModeToggleBtn = document.getElementById("toggle-light-mode");
const apiSetupBtn = document.getElementById("btn-api-setup");
const apiModal = document.getElementById("modal-api-setup");
const apiKeyInput = document.getElementById("api-key-input");
const apiSaveBtn = document.getElementById("btn-api-save");
const apiOfflineBtn = document.getElementById("btn-api-offline");
const panelTitle = document.getElementById("active-panel-title");
const panelStatus = document.getElementById("panel-status-label");
const panelView = document.getElementById("active-panel-view");

// Sound Elements
const soundMasterToggle = document.getElementById("sound-master-toggle");
const soundSfxToggle = document.getElementById("sound-sfx-toggle");
const soundAmbienceToggle = document.getElementById("sound-ambience-toggle");

// Sync Elements
const supabaseUrlInput = document.getElementById("supabase-url-input");
const supabaseKeyInput = document.getElementById("supabase-key-input");
const supabaseUuidInput = document.getElementById("supabase-uuid-input");
const btnCopySyncId = document.getElementById("btn-copy-sync-id");
const btnCopySyncLink = document.getElementById("btn-copy-sync-link");
const importExportTextarea = document.getElementById("import-export-textarea");
const btnImportState = document.getElementById("btn-import-state");

// Active Tab Router
let activeTab = "quests";

const TAB_INIT_FUNCTIONS = {
  quests: { title: "Daily Quest Board", status: "Quests Active", init: initQuestsView },
  language: { title: "Icelandic Trainer", status: "Mining Sentences", init: initLanguageView },
  athlete: { title: "Desk Athlete", status: "Focus & Stretch", init: initAthleteView },
  quiz: { title: "Parasitology Quiz", status: "Resident Level", init: initQuizView },
  bestiary: { title: "Parasite Bestiary", status: "Collectible Collection", init: initBestiaryView },
  achievements: { title: "Achievements", status: "Legendary Feats", init: initAchievementsView }
};

// Web Audio API Ambient Drone Nodes
let ambientAudioCtx = null;
let droneOsc1 = null;
let droneOsc2 = null;
let droneGain = null;
let filterNode = null;
let modulatorOsc = null;
let modulatorGain = null;

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  // Initialize State
  initGamification();
  
  // Setup HUD and UI State
  updateHud();
  setupRuneStones();
  setupSettings();
  setupRouter();
  setupFocusMode();
  
  // Check Setup Modal on first load
  checkApiKeyStatus();
  
  // Load Default view
  loadView(activeTab);

  // Setup Sound Toggles & Autoplay listeners
  initAudioAutoPlay();
});

// Update XP Bar & HUD labels
function updateHud() {
  const currentLevel = playerState.level;
  const currentXp = playerState.xp;
  const nextLevelXp = currentLevel * 100;
  const pct = (currentXp / nextLevelXp) * 100;
  
  xpBar.style.width = `${pct}%`;
  xpText.textContent = `${currentXp} / ${nextLevelXp} XP`;
  levelTitle.textContent = getLevelTitle(currentLevel);
  
  // Offline Banner sync
  if (isOfflineMode()) {
    offlineBanner.style.display = "block";
  } else {
    offlineBanner.style.display = "none";
  }
}

// Generate the 5 Runic Stones
function setupRuneStones() {
  const runePaths = [
    "M50,30 L50,90 M50,45 L75,30 M50,65 L75,50", // Fehu (Wealth)
    "M50,30 L50,90 M50,45 L75,60 M50,30 L75,45", // Ansuz (Wisdom)
    "M35,30 L35,90 M35,30 H55 C65,30 65,55 55,55 H35 M55,55 L70,90", // Raidho (Travel)
    "M35,35 L65,60 L35,85", // Kenaz (Torch)
    "M35,30 L65,90 M65,30 L35,90" // Gebo (Gift)
  ];
  
  streakRow.innerHTML = "";
  const activeStreak = playerState.streak;
  
  // Map streak count to 5 stones (cycles if > 5)
  const displayStreak = activeStreak % 6; // e.g. 7 days = 2 active stones, etc. (Or cap at 5)
  const cappedStreak = Math.min(5, activeStreak);
  
  for (let i = 0; i < 5; i++) {
    const isActive = i < cappedStreak;
    const path = runePaths[i];
    
    // SVG Creation
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", `rune-stone ${isActive ? 'active' : ''}`);
    svg.setAttribute("viewBox", "0 0 100 120");
    
    const polygon = document.createElementNS(svgNS, "polygon");
    polygon.setAttribute("points", "50,5 95,28 95,92 50,115 5,92 5,28");
    polygon.setAttribute("style", `transition: all 0.3s ease;`);
    
    const runePath = document.createElementNS(svgNS, "path");
    runePath.setAttribute("d", path);
    runePath.setAttribute("fill", "none");
    runePath.setAttribute("stroke-width", "8");
    runePath.setAttribute("stroke-linecap", "round");
    runePath.setAttribute("stroke-linejoin", "round");
    
    svg.appendChild(polygon);
    svg.appendChild(runePath);
    streakRow.appendChild(svg);
  }
}

// Router Event Listeners
function setupRouter() {
  document.querySelectorAll(".nav-item-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".nav-item-btn").forEach(b => b.classList.remove("active"));
      
      const target = e.currentTarget;
      target.classList.add("active");
      
      activeTab = target.dataset.tab;
      loadView(activeTab);
    });
  });
}

function loadView(tabId) {
  const config = TAB_INIT_FUNCTIONS[tabId];
  if (!config) return;
  
  panelTitle.textContent = config.title;
  panelStatus.textContent = config.status;
  
  panelView.style.opacity = 0;
  setTimeout(() => {
    config.init(panelView);
    panelView.style.transition = "opacity 0.25s ease";
    panelView.style.opacity = 1;
  }, 100);
}

// Settings toggles & setup
function setupSettings() {
  // Light / Dark mode toggle
  const savedMode = localStorage.getItem("void_killer_theme");
  if (savedMode === "light") {
    document.body.classList.add("light-mode");
  }
  
  lightModeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const mode = document.body.classList.contains("light-mode") ? "light" : "dark";
    localStorage.setItem("void_killer_theme", mode);
  });
  
  // Open API Key Setup modal
  apiSetupBtn.addEventListener("click", () => {
    const key = getApiKey();
    if (key && key !== "offline") {
      apiKeyInput.value = key;
    } else {
      apiKeyInput.value = "";
    }
    
    // Fill Sound settings values
    soundMasterToggle.checked = playerState.soundSettings.master;
    soundSfxToggle.checked = playerState.soundSettings.sfx;
    soundAmbienceToggle.checked = playerState.soundSettings.ambience;
    
    // Fill Supabase sync settings
    supabaseUrlInput.value = playerState.supabaseConfig.url || "";
    supabaseKeyInput.value = playerState.supabaseConfig.key || "";
    supabaseUuidInput.value = playerState.supabaseConfig.userId || "";
    
    // Fill Export text state
    importExportTextarea.value = JSON.stringify(playerState, null, 2);
    
    apiModal.classList.add("active");
  });

  // Copy Sync ID button
  btnCopySyncId.addEventListener("click", () => {
    supabaseUuidInput.select();
    document.execCommand("copy");
    alert("User Sync ID copied to clipboard!");
  });

  // Copy Sync Link button
  btnCopySyncLink.addEventListener("click", () => {
    const serialized = btoa(unescape(encodeURIComponent(JSON.stringify(playerState))));
    const link = window.location.origin + window.location.pathname + '#sync=' + serialized;
    
    // Create temp input to copy
    const tempInput = document.createElement("input");
    tempInput.value = link;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    
    alert("Shareable Grimoire Sync Link copied to clipboard! Send this link to your friend so they can import your progress directly.");
  });

  // Import State button
  btnImportState.addEventListener("click", () => {
    try {
      const parsed = JSON.parse(importExportTextarea.value);
      if (parsed && typeof parsed === "object" && parsed.level !== undefined) {
        if (confirm("Are you sure you want to overwrite your state with this backup?")) {
          localStorage.setItem("void_killer_player_state", JSON.stringify(parsed));
          alert("State imported successfully. Reloading Grimoire!");
          window.location.reload();
        }
      } else {
        alert("Invalid state structure. Must be a valid Void Killer save object.");
      }
    } catch (e) {
      alert("Failed to parse JSON state: " + e.message);
    }
  });
}

// Check if API key is present
function checkApiKeyStatus() {
  const key = getApiKey();
  if (!key) {
    apiModal.classList.add("active");
  }
}

// Save Key / Offline Mode Modal Handlers
apiSaveBtn.addEventListener("click", () => {
  // Save Gemini Key
  const key = apiKeyInput.value.trim();
  if (key) {
    setApiKey(key);
    localStorage.setItem("void_killer_offline_flag", "false");
  } else {
    setApiKey(null);
  }
  
  // Save Sound Settings
  playerState.soundSettings.master = soundMasterToggle.checked;
  playerState.soundSettings.sfx = soundSfxToggle.checked;
  playerState.soundSettings.ambience = soundAmbienceToggle.checked;
  
  // Save Supabase Sync configuration
  const oldUrl = playerState.supabaseConfig.url;
  const oldKey = playerState.supabaseConfig.key;
  
  playerState.supabaseConfig.url = supabaseUrlInput.value.trim();
  playerState.supabaseConfig.key = supabaseKeyInput.value.trim();
  
  savePlayerState();

  // If Supabase changed, re-initialize
  if (playerState.supabaseConfig.url !== oldUrl || playerState.supabaseConfig.key !== oldKey) {
    initSupabase();
  }

  // Handle ambient audio state
  if (canPlaySound('ambience')) {
    startAmbientDrone();
  } else {
    stopAmbientDrone();
  }

  apiModal.classList.remove("active");
  updateHud();
});

apiOfflineBtn.addEventListener("click", () => {
  setApiKey("offline");
  localStorage.setItem("void_killer_offline_flag", "true");
  
  // Also save settings toggles in offline mode
  playerState.soundSettings.master = soundMasterToggle.checked;
  playerState.soundSettings.sfx = soundSfxToggle.checked;
  playerState.soundSettings.ambience = soundAmbienceToggle.checked;
  
  savePlayerState();
  
  // Handle ambient audio state
  if (canPlaySound('ambience')) {
    startAmbientDrone();
  } else {
    stopAmbientDrone();
  }

  apiModal.classList.remove("active");
  updateHud();
});

// Focus "Just One Thing" Mode Toggle
function setupFocusMode() {
  focusToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("focus-mode");
  });
}

// Web Audio API ambient hum synth
function startAmbientDrone() {
  if (ambientAudioCtx) return; // Already running
  
  try {
    ambientAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Low frequency drone oscillators (Harmonics at A1 55Hz and detuned E2 82Hz)
    droneOsc1 = ambientAudioCtx.createOscillator();
    droneOsc1.type = 'sawtooth';
    droneOsc1.frequency.setValueAtTime(55, ambientAudioCtx.currentTime);
    
    droneOsc2 = ambientAudioCtx.createOscillator();
    droneOsc2.type = 'triangle';
    droneOsc2.frequency.setValueAtTime(82.4, ambientAudioCtx.currentTime);
    droneOsc2.detune.setValueAtTime(4, ambientAudioCtx.currentTime);
    
    // Low pass filter to create a muffled dungeon drone
    filterNode = ambientAudioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(110, ambientAudioCtx.currentTime);
    filterNode.Q.setValueAtTime(2.5, ambientAudioCtx.currentTime);
    
    // LFO modulator to pulse the volume (0.07Hz = 1 cycle per 14s)
    modulatorOsc = ambientAudioCtx.createOscillator();
    modulatorOsc.type = 'sine';
    modulatorOsc.frequency.setValueAtTime(0.07, ambientAudioCtx.currentTime);
    
    modulatorGain = ambientAudioCtx.createGain();
    modulatorGain.gain.setValueAtTime(0.025, ambientAudioCtx.currentTime);
    
    // Master drone gain node
    droneGain = ambientAudioCtx.createGain();
    droneGain.gain.setValueAtTime(0.035, ambientAudioCtx.currentTime);
    
    // Connect nodes
    modulatorOsc.connect(modulatorGain);
    modulatorGain.connect(droneGain.gain);
    
    droneOsc1.connect(filterNode);
    droneOsc2.connect(filterNode);
    filterNode.connect(droneGain);
    droneGain.connect(ambientAudioCtx.destination);
    
    // Start oscillators
    droneOsc1.start(0);
    droneOsc2.start(0);
    modulatorOsc.start(0);
    
    console.log("Dark background ambient drone started.");
  } catch (err) {
    console.warn("Ambient Web Audio error:", err);
  }
}

function stopAmbientDrone() {
  try {
    if (droneOsc1) { droneOsc1.stop(); droneOsc1 = null; }
    if (droneOsc2) { droneOsc2.stop(); droneOsc2 = null; }
    if (modulatorOsc) { modulatorOsc.stop(); modulatorOsc = null; }
    if (ambientAudioCtx) { ambientAudioCtx.close(); ambientAudioCtx = null; }
    console.log("Dark background ambient drone stopped.");
  } catch (e) {
    console.warn("Failed to stop ambient drone:", e);
  }
}

// Bind Autoplay activation on first interaction
function initAudioAutoPlay() {
  const triggerStart = () => {
    if (canPlaySound('ambience')) {
      startAmbientDrone();
    }
    // Remove listeners once activated
    window.removeEventListener('click', triggerStart);
    window.removeEventListener('keydown', triggerStart);
    window.removeEventListener('touchstart', triggerStart);
  };
  
  window.addEventListener('click', triggerStart);
  window.addEventListener('keydown', triggerStart);
  window.addEventListener('touchstart', triggerStart);
}

// Global state sync listener
window.addEventListener("player-state-changed", () => {
  updateHud();
  setupRuneStones();
});

// Listen for Level-Up custom event
window.addEventListener("player-level-up", (e) => {
  const state = e.detail;
  triggerLevelUpBanner(state.level);
});

function triggerLevelUpBanner(level) {
  const banner = document.createElement("div");
  banner.setAttribute("style", `
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(14, 11, 8, 0.95);
    z-index: 2000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.5s ease forwards;
  `);
  
  banner.innerHTML = `
    <h1 style="font-size: 3.5rem; color: var(--accent-gold); text-align: center; margin-bottom: 1rem; animation: scaleUp 0.6s ease forwards;">
      RUNES EMPOWERED
    </h1>
    <h2 style="font-size: 2rem; color: var(--text-cream); text-align: center; margin-bottom: 2rem;">
      ${getLevelTitle(level)}
    </h2>
    <button class="btn-stone" style="font-size: 1.1rem; padding: 0.8rem 2rem;">Seize Power</button>
  `;
  
  document.body.appendChild(banner);
  
  // Respect sound rules
  if (canPlaySound('sfx')) {
    playLevelUpChime();
  }
  
  banner.querySelector("button").addEventListener("click", () => {
    banner.style.animation = "fadeOut 0.4s ease forwards";
    setTimeout(() => banner.remove(), 400);
  });
}

function playLevelUpChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const freqs = [220, 277.18, 329.63, 440, 554.37]; // A Major open chord
    const now = audioCtx.currentTime;
    
    freqs.forEach((f, idx) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      
      const triggerTime = now + (idx * 0.12);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.25, triggerTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, triggerTime + 2.0);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(triggerTime);
      osc.stop(triggerTime + 2.5);
    });
  } catch (err) {
    console.warn("Could not play level up sound", err);
  }
}
