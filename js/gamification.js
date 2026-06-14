// The Void Killer - Gamification Module

export let playerState = {
  xp: 0,
  level: 1,
  title: "The Unknowing Vessel",
  streak: 0,
  lastActiveTimestamp: null,
  completedQuestsToday: 0,
  cardCollection: [], // List of parasite IDs
  leitnerBoxes: { box1: [], box2: [], box3: [] }, // Vocab sentence cards
  diagnosedCount: 0, // Correct quiz answers count (historic)
  icelandicWordsMastered: 0, // Correct Leitner answers in Box 3
  achievements: [], // List of unlocked achievement IDs
  
  // NEW OVERHAUL STATE VARIABLES
  hydrationToday: 0, // Current daily water in ml
  hydrationCompleted: false, // True if daily goal reached
  hydrationCompletedCount: 0, // Total days completed hydration goal
  quizStats: {
    correctCount: 0,
    incorrectCount: 0,
    roundsPlayed: 0
  },
  soundSettings: {
    master: true,
    sfx: true,
    ambience: false
  },
  supabaseConfig: {
    url: "",
    key: "",
    userId: ""
  },
  crowFactsShown: [], // Last 30 facts to prevent repetition
  lastQuestResetDate: "",
  athleteSessionState: null
};

const LEVEL_TITLES = {
  1: "The Unknowing Vessel",
  5: "Seeker of Rot",
  10: "Branded by Infection",
  20: "Herald of the Crawling Dark",
  35: "Elden Pathogen",
  50: "Godhost"
};

export const ACHIEVEMENTS_DB = {
  diagnose_1: { id: "diagnose_1", title: "First Diagnosis", desc: "Correctly identify 1 parasitic pathogen." },
  diagnose_10: { id: "diagnose_10", title: "10 Correct Diagnoses", desc: "Correctly identify 10 parasitic pathogens." },
  diagnose_50: { id: "diagnose_50", title: "50 Correct Diagnoses", desc: "Correctly identify 50 parasitic pathogens." },
  streak_7: { id: "streak_7", title: "7 Day Streak", desc: "Maintain your daily focus for 7 consecutive days." },
  streak_30: { id: "streak_30", title: "30 Day Streak", desc: "Maintain your daily focus for 30 consecutive days." },
  vocab_100: { id: "vocab_100", title: "100 Icelandic Words Mastered", desc: "Promote 100 sentences/words to Leitner Box 3." },
  hydration_master: { id: "hydration_master", title: "Hydration Master", desc: "Complete your daily hydration goal 5 times." },
  bestiary_full: { id: "bestiary_full", title: "Full Bestiary Unlocked", desc: "Discover all 10 standard parasites in your bestiary." }
};

let supabaseClient = null;

// Initialize state and integrations
export function initGamification() {
  const saved = localStorage.getItem("void_killer_player_state");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Deep merge / fallback assignment to ensure new fields are initialized
      playerState = {
        ...playerState,
        ...parsed,
        quizStats: { ...playerState.quizStats, ...(parsed.quizStats || {}) },
        soundSettings: { ...playerState.soundSettings, ...(parsed.soundSettings || {}) },
        supabaseConfig: { ...playerState.supabaseConfig, ...(parsed.supabaseConfig || {}) }
      };
    } catch (e) {
      console.error("Could not parse player state, resetting.", e);
    }
  }

  // Generate Unique Sync ID if missing
  if (!playerState.supabaseConfig.userId) {
    playerState.supabaseConfig.userId = 'vk-' + Math.random().toString(36).substr(2, 9) + '-' + Math.random().toString(36).substr(2, 5);
  }

  // Perform daily reset check
  checkStreakGracePeriod();
  
  // Initialize Supabase if key settings exist
  initSupabase();

  // Check Sync Link parameters
  checkUrlHashSync();

  savePlayerState();
}

export function initSupabase() {
  const cfg = playerState.supabaseConfig;
  if (cfg && cfg.url && cfg.key) {
    try {
      if (window.supabase) {
        supabaseClient = window.supabase.createClient(cfg.url, cfg.key);
        console.log("Supabase client initialized successfully.");
      }
    } catch (e) {
      console.warn("Could not bind Supabase client:", e);
    }
  } else {
    supabaseClient = null;
  }
}

export async function syncToSupabase() {
  if (!supabaseClient) return;
  const userId = playerState.supabaseConfig.userId;
  if (!userId) return;

  try {
    const { error } = await supabaseClient
      .from('void_killer_saves')
      .upsert({ id: userId, state: playerState, updated_at: new Date().toISOString() });
    
    if (error) {
      console.warn("Supabase backup failed:", error.message);
    } else {
      console.log("Supabase backup successful.");
    }
  } catch (e) {
    console.warn("Supabase sync failed (offline or network error):", e);
  }
}

export async function pullFromSupabase(syncId) {
  if (!supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient
      .from('void_killer_saves')
      .select('state')
      .eq('id', syncId)
      .single();
    
    if (error) throw error;
    return data?.state || null;
  } catch (e) {
    console.error("Failed to pull from Supabase:", e);
    throw e;
  }
}

export function savePlayerState() {
  localStorage.setItem("void_killer_player_state", JSON.stringify(playerState));
  
  // Dispatch event for UI updates
  window.dispatchEvent(new CustomEvent("player-state-changed"));
  
  // Auto-sync in background to Supabase if configured
  syncToSupabase();
}

export function getLevelTitle(level) {
  let activeTitle = LEVEL_TITLES[1];
  for (const lvl of Object.keys(LEVEL_TITLES).map(Number).sort((a,b) => a - b)) {
    if (level >= lvl) {
      activeTitle = LEVEL_TITLES[lvl];
    }
  }
  return `Level ${level}: ${activeTitle}`;
}

export function addXp(amount) {
  if (playerState.level >= 50) return; // Level cap
  
  playerState.xp += amount;
  let nextLevelXp = playerState.level * 100;
  let leveledUp = false;
  
  while (playerState.xp >= nextLevelXp && playerState.level < 50) {
    playerState.xp -= nextLevelXp;
    playerState.level++;
    nextLevelXp = playerState.level * 100;
    leveledUp = true;
    
    // Check level 50 achievement
    if (playerState.level >= 50) {
      unlockAchievement("godhost");
      playerState.xp = 0;
    }
  }
  
  playerState.title = getLevelTitle(playerState.level);
  savePlayerState();
  
  if (leveledUp) {
    window.dispatchEvent(new CustomEvent("player-level-up", { detail: playerState }));
  }
}

function checkStreakGracePeriod() {
  const now = Date.now();
  if (!playerState.lastActiveTimestamp) {
    playerState.streak = 0;
    return;
  }
  
  const diffHours = (now - playerState.lastActiveTimestamp) / (1000 * 60 * 60);
  
  if (diffHours > 36) {
    playerState.streak = 0;
    savePlayerState();
    setTimeout(() => {
      triggerGentleStreakAlert("Your runic fire has faded. Let us begin another journey.");
    }, 1000);
  }
}

export function recordActivity() {
  const now = Date.now();
  const todayDateString = new Date(now).toDateString();
  const lastActiveDateString = playerState.lastActiveTimestamp 
    ? new Date(playerState.lastActiveTimestamp).toDateString()
    : "";
    
  if (!playerState.lastActiveTimestamp) {
    playerState.streak = 1;
  } else {
    const diffHours = (now - playerState.lastActiveTimestamp) / (1000 * 60 * 60);
    
    if (diffHours > 36) {
      playerState.streak = 1;
    } else if (todayDateString !== lastActiveDateString) {
      playerState.streak++;
      
      // Check streaks achievements
      if (playerState.streak >= 7) {
        unlockAchievement("streak_7");
      }
      if (playerState.streak >= 30) {
        unlockAchievement("streak_30");
      }
    }
  }
  
  playerState.lastActiveTimestamp = now;
  savePlayerState();
}

// Sound Settings checks
export function canPlaySound(type) {
  const settings = playerState.soundSettings;
  if (!settings.master) return false;
  if (type === 'sfx') return settings.sfx;
  if (type === 'ambience') return settings.ambience;
  return true;
}

// Achievements
export function unlockAchievement(id) {
  if (playerState.achievements.includes(id)) return; // Already unlocked
  
  playerState.achievements.push(id);
  savePlayerState();
  
  triggerAchievementBanner(id);
}

function triggerAchievementBanner(id) {
  const ach = ACHIEVEMENTS_DB[id];
  if (!ach) return;
  
  const banner = document.createElement("div");
  banner.setAttribute("style", `
    position: fixed;
    bottom: 2rem;
    left: 2rem;
    background-color: var(--surface-color);
    border: double 4px var(--border-gold);
    box-shadow: 0 10px 25px rgba(0,0,0,0.8);
    padding: 1rem 1.5rem;
    z-index: 1500;
    max-width: 350px;
    display: flex;
    flex-direction: column;
    animation: slideInLeft 0.5s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
  `);
  
  banner.innerHTML = `
    <span class="ui-label" style="color: var(--accent-gold); font-size: 0.75rem; margin-bottom: 0.25rem;">✦ Legendary Feat Achieved ✦</span>
    <h4 style="font-family: 'Cinzel'; margin: 0 0 0.25rem 0; font-size: 1.1rem; color: var(--text-cream);">${ach.title}</h4>
    <p style="margin: 0; font-size: 0.9rem; color: var(--text-muted); font-family: 'EB Garamond';">${ach.desc}</p>
  `;
  
  document.body.appendChild(banner);
  
  // Respect sound rules
  if (canPlaySound('sfx')) {
    playAchievementChime();
  }
  
  setTimeout(() => {
    banner.style.animation = "slideOutLeft 0.5s ease forwards";
    setTimeout(() => banner.remove(), 500);
  }, 5000);
}

function triggerGentleStreakAlert(message) {
  const alertBox = document.createElement("div");
  alertBox.setAttribute("style", `
    position: fixed;
    top: 5rem;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--surface-color);
    border: 1px solid var(--border-gold-dim);
    box-shadow: 0 4px 15px rgba(0,0,0,0.6);
    padding: 0.75rem 1.5rem;
    z-index: 1800;
    text-align: center;
    border-radius: 2px;
    font-family: 'EB Garamond', serif;
    font-size: 1.1rem;
    color: var(--text-muted);
    animation: fadeIn 0.4s ease forwards;
  `);
  
  alertBox.innerHTML = `
    <span style="color: var(--accent-gold); margin-right: 0.5rem;">✦</span>
    <span>${message}</span>
    <button class="btn-stone" style="font-size: 0.7rem; padding: 0.25rem 0.5rem; margin-left: 1rem;">Accept</button>
  `;
  
  document.body.appendChild(alertBox);
  alertBox.querySelector("button").addEventListener("click", () => {
    alertBox.remove();
  });
}

function playAchievementChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    const notes = [329.63, 493.88, 659.25]; // E4, B4, E5
    
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + (idx * 0.15));
      
      const noteStart = now + (idx * 0.15);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.2, noteStart + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.8);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(noteStart);
      osc.stop(noteStart + 1.0);
    });
  } catch (err) {
    console.warn("Could not play sound", err);
  }
}

// Overhauled Incremental Sync actions
export function incrementDiagnosedCount() {
  playerState.diagnosedCount++;
  playerState.quizStats.correctCount++;
  recordActivity();
  
  // Achievements trigger
  if (playerState.diagnosedCount >= 1) {
    unlockAchievement("diagnose_1");
  }
  if (playerState.diagnosedCount >= 10) {
    unlockAchievement("diagnose_10");
  }
  if (playerState.diagnosedCount >= 50) {
    unlockAchievement("diagnose_50");
  }
  
  savePlayerState();
}

export function updateMasteredWords(count) {
  playerState.icelandicWordsMastered = count;
  recordActivity();
  
  if (playerState.icelandicWordsMastered >= 100) {
    unlockAchievement("vocab_100");
  }
  
  savePlayerState();
}

export function updateBestiaryCount(count) {
  if (count >= 10) {
    unlockAchievement("bestiary_full");
  }
  savePlayerState();
}

// Hydration Quest state changes
export function addHydration(amount) {
  playerState.hydrationToday += amount;
  if (playerState.hydrationToday >= 2000) {
    playerState.hydrationToday = 2000;
    if (!playerState.hydrationCompleted) {
      playerState.hydrationCompleted = true;
      playerState.hydrationCompletedCount++;
      addXp(40); // 40 XP
      
      // Dispatch event to advance Hydration Daily Quest progress
      window.dispatchEvent(new CustomEvent("hydration-completed"));
      
      if (playerState.hydrationCompletedCount >= 5) {
        unlockAchievement("hydration_master");
      }
    }
  }
  savePlayerState();
}

export function resetDailyHydration() {
  playerState.hydrationToday = 0;
  playerState.hydrationCompleted = false;
  savePlayerState();
}

// URL sync checker on load
export function checkUrlHashSync() {
  const hash = window.location.hash;
  if (hash && hash.startsWith("#sync=")) {
    try {
      const base64Data = hash.substring(6);
      const decodedJson = decodeURIComponent(escape(atob(base64Data)));
      const sharedState = JSON.parse(decodedJson);
      
      if (sharedState && typeof sharedState === "object" && sharedState.level !== undefined) {
        // Clear hash immediately to prevent loop
        window.location.hash = "";
        
        const confirmSync = confirm(`✦ Shared Grimoire Found ✦\nDo you want to import this progress?\n\nLevel: ${sharedState.level}\nXP: ${sharedState.xp}\nAchievements: ${sharedState.achievements?.length || 0}\n\nWarning: This will overwrite your current progress.`);
        
        if (confirmSync) {
          playerState = {
            ...playerState,
            ...sharedState,
            soundSettings: sharedState.soundSettings || playerState.soundSettings,
            supabaseConfig: sharedState.supabaseConfig || playerState.supabaseConfig
          };
          savePlayerState();
          alert("Grimoire Save State loaded and synchronized successfully!");
          window.location.reload();
        }
      }
    } catch (e) {
      console.warn("Failed to parse sync link:", e);
    }
  }
}
