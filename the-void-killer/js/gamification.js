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
  diagnosedCount: 0, // Correct quiz answers
  icelandicWordsMastered: 0, // Correct Leitner answers in Box 3
  achievements: [] // List of unlocked achievement IDs
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
  diagnose_10: {
    id: "diagnose_10",
    title: "Diagnosed 10 Cases",
    desc: "Correctly identify 10 parasitic pathogens."
  },
  streak_7: {
    id: "streak_7",
    title: "Survived 7-Day Streak",
    desc: "Maintain your daily focus for 7 consecutive days."
  },
  vocab_100: {
    id: "vocab_100",
    title: "100 Icelandic Words Mastered",
    desc: "Promote 100 sentences/words to Leitner Box 3."
  },
  bestiary_full: {
    id: "bestiary_full",
    title: "Full Bestiary Unlocked",
    desc: "Discover all 10 standard parasites in your bestiary."
  },
  godhost: {
    id: "godhost",
    title: "Godhost Ascended",
    desc: "Reach Level 50 and become one with the crawl."
  }
};

export function initGamification() {
  const saved = localStorage.getItem("void_killer_player_state");
  if (saved) {
    try {
      playerState = JSON.parse(saved);
      // Ensure all objects exist (forward compatibility)
      if (!playerState.achievements) playerState.achievements = [];
      if (!playerState.cardCollection) playerState.cardCollection = [];
      if (!playerState.leitnerBoxes) playerState.leitnerBoxes = { box1: [], box2: [], box3: [] };
    } catch (e) {
      console.error("Could not parse player state, resetting.", e);
    }
  }
  
  // Perform daily check
  checkStreakGracePeriod();
  
  savePlayerState();
}

export function savePlayerState() {
  localStorage.setItem("void_killer_player_state", JSON.stringify(playerState));
  // Notify App shell
  window.dispatchEvent(new CustomEvent("player-state-changed"));
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

// Streak tracking with 36-hour grace period
function checkStreakGracePeriod() {
  const now = Date.now();
  if (!playerState.lastActiveTimestamp) {
    playerState.streak = 0;
    return;
  }
  
  const diffHours = (now - playerState.lastActiveTimestamp) / (1000 * 60 * 60);
  
  if (diffHours > 36) {
    // Grace period expired! Reset streak gently
    playerState.streak = 0;
    savePlayerState();
    
    // Dispatch event to show a gentle notification on load
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
      // It's a new day and within 36 hours! Increment streak
      playerState.streak++;
      
      // Check 7-day streak achievement
      if (playerState.streak >= 7) {
        unlockAchievement("streak_7");
      }
    }
    // If it is the same day, we keep the current streak and just update the timestamp
  }
  
  playerState.lastActiveTimestamp = now;
  savePlayerState();
}

// Achievement checking
export function unlockAchievement(id) {
  if (playerState.achievements.includes(id)) return; // Already unlocked
  
  playerState.achievements.push(id);
  savePlayerState();
  
  // Show visual unlock banner
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
  
  // Add inline animation styles if not loaded
  const styleId = "achievement-animations-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes slideInLeft {
        from { transform: translateX(-120%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutLeft {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(-120%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  banner.innerHTML = `
    <span class="ui-label" style="color: var(--accent-gold); font-size: 0.75rem; margin-bottom: 0.25rem;">✦ Legendary Feat Achieved ✦</span>
    <h4 style="font-family: 'Cinzel'; margin: 0 0 0.25rem 0; font-size: 1.1rem; color: var(--text-cream);">${ach.title}</h4>
    <p style="margin: 0; font-size: 0.9rem; color: var(--text-muted); font-family: 'EB Garamond';">${ach.desc}</p>
  `;
  
  document.body.appendChild(banner);
  
  // Synthesize short epic sound for achievement
  playAchievementChime();
  
  // Slide out after 5 seconds
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
    
    // Quick rising interval: Perfect Fifth followed by Octave
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

// Increments items and checks achievements
export function incrementDiagnosedCount() {
  playerState.diagnosedCount++;
  recordActivity();
  
  if (playerState.diagnosedCount >= 10) {
    unlockAchievement("diagnose_10");
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
}
