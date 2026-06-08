// The Void Killer - Daily Quest Board Module

import { addXp, playerState, savePlayerState } from './gamification.js';

const QUEST_POOL = [
  { id: "quest_diagnose_2", text: "Diagnose 2 parasitology cases", target: 2, xpReward: 30 },
  { id: "quest_find_legendary", text: "Identify a LEGENDARY parasite", target: 1, xpReward: 50 },
  { id: "quest_icelandic_session", text: "Complete 1 Icelandic training session", target: 1, xpReward: 40 },
  { id: "quest_leitner_review", text: "Review 3 due Leitner cards", target: 3, xpReward: 30 },
  { id: "quest_athlete_routine", text: "Perform 1 Desk Athlete micro-routine", target: 1, xpReward: 30 },
  { id: "quest_athlete_stretch", text: "Stretch for a total of 120 seconds", target: 120, xpReward: 40 },
  { id: "quest_quiz_attending", text: "Diagnose 1 Attending-level clinical case", target: 1, xpReward: 40 },
  { id: "quest_icelandic_perfect", text: "Synthesize 1 perfect Icelandic sentence", target: 1, xpReward: 50 }
];

// Custom CSS for Quests
function injectQuestStyles() {
  const styleId = "quest-board-styles";
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .quest-list-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 700px;
      margin: 0 auto;
    }
    
    .quest-card {
      background-color: var(--surface-inner);
      border: 1px solid var(--border-gold-dim);
      padding: 1.25rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      position: relative;
      transition: all 0.3s ease;
    }
    
    .quest-card.completed {
      border-color: var(--accent-gold);
      background-color: rgba(201, 168, 76, 0.05);
    }
    
    .quest-info {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      flex-grow: 1;
    }
    
    .quest-title {
      font-size: 1.2rem;
      font-family: 'EB Garamond', serif;
      color: var(--text-cream);
      transition: all 0.3s ease;
    }
    
    .quest-card.completed .quest-title {
      text-decoration: line-through;
      color: var(--text-muted);
    }
    
    .quest-progress-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
    }
    
    .quest-bar-outer {
      height: 6px;
      background-color: #262118;
      border: 1px solid #4d3f2d;
      flex-grow: 1;
      position: relative;
    }
    
    .quest-bar-inner {
      height: 100%;
      background-color: var(--accent-gold);
      width: 0%;
      transition: width 0.3s ease;
    }
    
    .quest-card.completed .quest-bar-inner {
      background-color: #4c914c;
    }
    
    .quest-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-shrink: 0;
    }
    
    .reroll-counter-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border-gold-dim);
      padding-top: 1rem;
      margin-top: 1rem;
    }
    
    /* Particle burst container */
    .particle {
      position: fixed;
      pointer-events: none;
      width: 8px;
      height: 8px;
      background-color: var(--accent-gold);
      border-radius: 50%;
      z-index: 9999;
      animation: explode 1.2s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
    }
    
    @keyframes explode {
      0% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
      }
      100% {
        transform: translate(var(--tx), var(--ty)) scale(0.2);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Check and reset daily quests at midnight
export function checkDailyQuestsReset() {
  const today = new Date().toDateString();
  
  if (playerState.lastQuestResetDate !== today) {
    // Select 3 random unique quests
    const shuffled = [...QUEST_POOL].sort(() => 0.5 - Math.random());
    playerState.questsToday = shuffled.slice(0, 3).map(q => ({
      ...q,
      current: 0,
      completed: false
    }));
    playerState.questRerollsToday = 0;
    playerState.completedQuestsToday = 0; // reset counter
    playerState.lastQuestResetDate = today;
    savePlayerState();
  }
}

export function initQuestsView(container) {
  injectQuestStyles();
  checkDailyQuestsReset();
  
  renderQuestBoard(container);
}

function renderQuestBoard(container) {
  const quests = playerState.questsToday || [];
  const rerollsLeft = Math.max(0, 2 - playerState.questRerollsToday);
  const allCompleted = quests.every(q => q.completed);
  
  container.innerHTML = `
    <div class="quest-list-container">
      <h3 style="font-family: 'Cinzel'; color: var(--accent-gold); text-align: center;">Active Contracts</h3>
      <p style="text-align: center; color: var(--text-muted); font-size: 1.1rem; margin-bottom: 1.5rem;">
        Completing all 3 active daily quests awards a legendary pact bonus of <strong>+100 XP</strong>.
      </p>
      
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${quests.map((q, idx) => {
          const pct = Math.min(100, (q.current / q.target) * 100);
          return `
            <div class="quest-card ${q.completed ? 'completed' : ''}" data-id="${q.id}">
              <div class="quest-info">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <span class="quest-title">${q.text}</span>
                  <span style="font-size: 0.75rem; color: var(--accent-gold); font-family: 'Inter'; font-weight: bold;">
                    +${q.xpReward} XP
                  </span>
                </div>
                <div class="quest-progress-row">
                  <div class="quest-bar-outer">
                    <div class="quest-bar-inner" style="width: ${pct}%;"></div>
                  </div>
                  <span style="font-family: 'Inter'; font-size: 0.75rem; color: var(--text-muted); width: 40px; text-align: right;">
                    ${q.current}/${q.target}
                  </span>
                </div>
              </div>
              <div class="quest-actions">
                ${q.completed ? `
                  <span style="color: #4c914c; font-size: 1.5rem;">✦</span>
                ` : `
                  ${rerollsLeft > 0 ? `
                    <button class="btn-stone btn-reroll" data-idx="${idx}" style="font-size: 0.7rem; padding: 0.35rem 0.6rem;">
                      Reroll
                    </button>
                  ` : ''}
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="reroll-counter-row">
        <span class="ui-label" style="color: var(--text-muted); font-size: 0.75rem;">Rerolls Remaining: ${rerollsLeft} / 2</span>
        ${allCompleted ? `
          <span class="ui-label" style="color: var(--accent-gold); text-shadow: 0 0 8px var(--accent-gold-glow);">✦ ALL CONTRACTS SEALED ✦</span>
        ` : `
          <span class="ui-label" style="color: var(--accent-red); font-size: 0.75rem;">Contracts reset at midnight</span>
        `}
      </div>
    </div>
  `;

  // Bind Reroll Buttons
  container.querySelectorAll(".btn-reroll").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.currentTarget.dataset.idx);
      rerollQuest(idx, container);
    });
  });
}

function rerollQuest(idx, container) {
  if (playerState.questRerollsToday >= 2) return;
  
  // Get active quest IDs
  const activeIds = playerState.questsToday.map(q => q.id);
  // Filter pool for unused quests
  const availablePool = QUEST_POOL.filter(q => !activeIds.includes(q.id));
  
  if (availablePool.length === 0) return;
  
  // Choose random new quest
  const newQuest = availablePool[Math.floor(Math.random() * availablePool.length)];
  
  playerState.questsToday[idx] = {
    ...newQuest,
    current: 0,
    completed: false
  };
  
  playerState.questRerollsToday++;
  savePlayerState();
  
  // Re-render
  renderQuestBoard(container);
}

// Global Event Listeners to intercept actions and advance quest progress
export function registerQuestEvents() {
  
  // 1. Quiz Correct Answer
  window.addEventListener("quiz-correct-answer", (e) => {
    const { difficulty, parasiteRarity } = e.detail;
    
    advanceQuestProgress("quest_diagnose_2", 1);
    
    if (difficulty === "Attending") {
      advanceQuestProgress("quest_quiz_attending", 1);
    }
    
    if (parasiteRarity === "legendary") {
      advanceQuestProgress("quest_find_legendary", 1);
    }
  });

  // 2. Leitner card reviewed
  window.addEventListener("leitner-card-reviewed", (e) => {
    advanceQuestProgress("quest_leitner_review", 1);
  });

  // 3. Icelandic Session Completed
  window.addEventListener("icelandic-session-completed", (e) => {
    const { isPerfect } = e.detail;
    advanceQuestProgress("quest_icelandic_session", 1);
    if (isPerfect) {
      advanceQuestProgress("quest_icelandic_perfect", 1);
    }
  });

  // 4. Desk Athlete Routine Completed
  window.addEventListener("athlete-routine-completed", (e) => {
    const { durationSeconds } = e.detail;
    advanceQuestProgress("quest_athlete_routine", 1);
    advanceQuestProgress("quest_athlete_stretch", durationSeconds);
  });
}

// Helper to advance progress
function advanceQuestProgress(questId, amount) {
  checkDailyQuestsReset();
  
  const quests = playerState.questsToday || [];
  const quest = quests.find(q => q.id === questId);
  
  if (!quest || quest.completed) return;
  
  quest.current += amount;
  if (quest.current >= quest.target) {
    quest.current = quest.target;
    quest.completed = true;
    
    // Give direct quest XP reward
    addXp(quest.xpReward);
    
    // Check if this triggers the all-quests completion
    checkAllQuestsCompletion();
  }
  
  savePlayerState();
}

function checkAllQuestsCompletion() {
  const quests = playerState.questsToday || [];
  const allCompleted = quests.every(q => q.completed);
  
  if (allCompleted && playerState.completedQuestsToday === 0) {
    playerState.completedQuestsToday = 1;
    savePlayerState();
    
    // Award 100 XP pact bonus
    addXp(100);
    
    // Trigger particle burst
    setTimeout(() => {
      triggerParticleExplosion();
    }, 500);
  }
}

function triggerParticleExplosion() {
  const count = 60;
  const originX = window.innerWidth / 2;
  const originY = window.innerHeight / 2;
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    
    // Proportional directions
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 250;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    particle.style.setProperty("--tx", `${tx}px`);
    particle.style.setProperty("--ty", `${ty}px`);
    
    // Color variants (gold/crimson)
    const color = Math.random() > 0.5 ? "var(--accent-gold)" : "var(--accent-red)";
    particle.style.backgroundColor = color;
    
    particle.style.left = `${originX}px`;
    particle.style.top = `${originY}px`;
    
    document.body.appendChild(particle);
    
    // Cleanup particle
    setTimeout(() => {
      particle.remove();
    }, 1200);
  }
  
  // Synthesize chord for triumph
  playTriumphChime();
}

function playTriumphChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    
    // Major chord arpeggios that sustain
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C Major
    
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + (idx * 0.08));
      
      const noteStart = now + (idx * 0.08);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, noteStart + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStart + 1.8);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(noteStart);
      osc.stop(noteStart + 2.0);
    });
  } catch (err) {
    console.warn(err);
  }
}

// Initialize listeners on module load
registerQuestEvents();
checkDailyQuestsReset();
