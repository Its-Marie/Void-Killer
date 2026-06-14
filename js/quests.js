// The Void Killer - Daily Quest Board Module

import { addXp, playerState, savePlayerState, addHydration, resetDailyHydration } from './gamification.js';
import { callGeminiApi, isOfflineMode } from './api.js';

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

const FALLBACK_CROW_FACTS = [
  "Krähen besitzen ein episodisches Gedächtnis und erinnern sich über Jahre hinweg an Gesichter von Menschen, die sie bedroht haben.",
  "Neukaledonische Krähen stellen Hakenwerkzeuge aus Zweigen her, um Larven aus Rinde zu angeln – ein Beweis für vorausschauende Planung.",
  "Krähen veranstalten 'Begräbnisse': Finden sie eine tote Krähe, versammeln sie sich lautstark, um Gefahren in der Umgebung zu analysieren.",
  "Das Gehirn-Körper-Massenverhältnis von Krähen ähnelt dem von Schimpansen, was sie zu den intelligentesten Vögeln macht.",
  "Im Experiment warfen Krähen Steine in eine Röhre mit Wasser, um den Wasserspiegel anzuheben und an schwimmendes Futter zu gelangen.",
  "Krähen nutzen Autoreifen als Nussknacker: Sie legen Nüsse auf Zebrastreifen und warten geduldig, bis Ampelphasen das Aufpicken erlauben.",
  "Krähen nutzen komplexe Gesten, um die Aufmerksamkeit von Gruppenmitgliedern auf Objekte zu lenken – ähnlich wie menschliche Kleinkinder.",
  "Krähen kooperieren bei der Jagd: Ein Vogel lenkt das Raubtier ab, während der andere das Futter stiehlt.",
  "Krähen besitzen ein neuronales Substrat für subjektives Bewusstsein; sie wissen, was sie sehen, und können bewusste Entscheidungen treffen.",
  "Die Kommunikation von Krähen umfasst Dialekte: Gruppen in unterschiedlichen Regionen nutzen leicht abweichende Warnrufe.",
  "Krähen können zählen: Sie erfassen Mengen bis zu fünf visuell und können entsprechende Anzahlen von Rufen abgeben.",
  "Rabenvögel verstecken Futter und merken sich tausende Verstecke mit hoher räumlicher Präzision über mehrere Monate hinweg.",
  "Beobachtet eine Krähe einen potenziellen Dieb, täuscht sie das Verstecken von Futter oft nur vor, um Diebstahl zu verhindern.",
  "Junge Krähen lernen komplexe Fähigkeiten wie Werkzeugherstellung primär durch soziales Lernen und Nachahmung ihrer Eltern.",
  "Krähen besitzen die Fähigkeit zur mentalen Zeitreise: Sie erinnern sich, welches Futter sie wann versteckt haben und ob es bereits verdorben ist.",
  "Krähen spielen gerne: Im Winter wurden sie dabei beobachtet, wie sie schneebedeckte Dächer auf dem Rücken hinabrutschten.",
  "Die Nester von Krähen werden oft mit weichen Haaren von lebenden Säugetieren gepolstert, die sie Hunden direkt aus dem Fell zupfen.",
  "Krähen können menschliche Stimmen imitieren, Wörter lernen und Geräusche nachahmen, um andere Tiere oder Menschen zu täuschen.",
  "Krähen reiben Ameisen auf ihre Federn (Einemsen): Die Ameisensäure hilft, Parasiten und Federlinge abzutöten.",
  "Das Langzeitgedächtnis von Krähen hält über 5 Jahre an; sie erkennen vertraute Forscher wieder, selbst wenn diese Masken tragen.",
  "Krabben- und Muschelschalen werden von Krähen aus exakter Höhe auf Steine fallen gelassen, um die Schale effizient zu brechen.",
  "Krähen schlafen nachts in riesigen Schlafgemeinschaften mit bis zu Zehntausenden Vögeln, um Schutz vor Uhus zu finden.",
  "Dohlen können die Blickrichtung von Menschen deuten, um Nahrung zu finden oder Gefahren vorab einzuschätzen.",
  "Krähen nutzen den Stand von Sonne und Mond zur Navigation bei nächtlichen Gruppenwanderungen.",
  "Krähen lösen mehrstufige Rätsel, bei denen sie ein kurzes Werkzeug nutzen müssen, um an ein längeres Werkzeug zu gelangen.",
  "Das Nidopallium im Krähengehirn verarbeitet komplexe kognitive Aufgaben auf ähnliche Weise wie der Neocortex bei Säugetieren.",
  "Kräheneltern teilen ihr Revier manchmal jahrelang mit ihren flüggen Nachkommen, um diese bei der Futtersuche zu unterstützen.",
  "Krähen passen ihre Scheu vor Menschen an deren Verhalten an: Sie sind zahmer in Parks und scheuer in Jagdgebieten.",
  "Untereinander schließen Krähen langfristige Bündnisse; sie trösten einander nach Konflikten durch sanftes Gefiederputzen.",
  "Corviden besitzen die Fähigkeit, Ähnlichkeitsbeziehungen zwischen Mustern zu erkennen, was der analogen Denkweise entspricht."
];

// Custom CSS for Quests, Hydration, and Crow Facts
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
      margin-top: 0.5rem;
    }
    
    /* Hydration widget style */
    .hydration-widget {
      background-color: var(--surface-inner);
      border: double 4px var(--border-gold);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      position: relative;
    }
    
    .hydration-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .hydration-bar-container {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .btn-quick-add {
      background-color: #2b231b;
      border: 1px solid var(--border-gold-dim);
      color: var(--text-cream);
      padding: 0.4rem 0.8rem;
      cursor: pointer;
      font-size: 0.75rem;
      transition: all 0.2s ease;
    }
    .btn-quick-add:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
      box-shadow: 0 0 8px var(--accent-gold-glow);
    }
    
    /* Crow Fact Style */
    .crow-fact-card {
      background-color: var(--surface-inner);
      border: 1px solid var(--border-gold-dim);
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
      font-style: italic;
    }
    
    .crow-watermark {
      position: absolute;
      right: 15px;
      bottom: 10px;
      width: 60px;
      height: 60px;
      opacity: 0.08;
      fill: var(--accent-gold);
      pointer-events: none;
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

// Reset daily elements
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
    playerState.completedQuestsToday = 0;
    playerState.lastQuestResetDate = today;
    
    // Reset daily hydration
    resetDailyHydration();
    
    savePlayerState();
  }
}

export function initQuestsView(container) {
  injectQuestStyles();
  checkDailyQuestsReset();
  
  // Trigger Crow Fact loading
  loadCrowFact().then(() => {
    renderQuestBoard(container);
  });
}

// Crow facts generation with Gemini / sequential fallback
async function loadCrowFact() {
  const today = new Date().toDateString();
  
  // Already loaded today
  if (playerState.lastCrowFactDate === today && playerState.lastCrowFactText) {
    return;
  }
  
  if (isOfflineMode()) {
    loadFallbackCrowFact(today);
    return;
  }
  
  // Excluded facts block in prompt
  const exclusions = (playerState.crowFactsShown || []).slice(-15).join(", ");
  const prompt = `Generate a single fascinating, academically advanced fun fact about crows (family Corvidae), focusing on their intelligence, tool use, memory, social behavior, communication, or recent research. It should be a single paragraph (2-3 sentences). Translate it into German. Do not repeat facts resembling these: [${exclusions}]. Return ONLY valid JSON: { fact: string }.`;
  
  try {
    const data = await callGeminiApi(prompt);
    if (data && data.fact) {
      playerState.lastCrowFactText = data.fact;
      playerState.lastCrowFactDate = today;
      
      // Update repetitions list
      if (!playerState.crowFactsShown) playerState.crowFactsShown = [];
      playerState.crowFactsShown.push(data.fact);
      if (playerState.crowFactsShown.length > 35) playerState.crowFactsShown.shift();
      
      savePlayerState();
    } else {
      throw new Error("Invalid structure");
    }
  } catch (e) {
    console.warn("Crow fact API failed, pulling fallback:", e);
    loadFallbackCrowFact(today);
  }
}

function loadFallbackCrowFact(today) {
  // Determine index based on date hash
  const charSum = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const idx = charSum % FALLBACK_CROW_FACTS.length;
  
  playerState.lastCrowFactText = FALLBACK_CROW_FACTS[idx];
  playerState.lastCrowFactDate = today;
  savePlayerState();
}

function renderQuestBoard(container) {
  const quests = playerState.questsToday || [];
  const rerollsLeft = Math.max(0, 2 - playerState.questRerollsToday);
  const allCompleted = quests.every(q => q.completed);
  
  const hydrationPct = (playerState.hydrationToday / 2000) * 100;
  
  container.innerHTML = `
    <div class="quest-list-container">
      <h3 style="font-family: 'Cinzel'; color: var(--accent-gold); text-align: center;">Active Contracts</h3>
      
      <!-- Daily Quests List -->
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
          <span class="ui-label" style="color: var(--accent-gold); text-shadow: 0 0 8px var(--accent-gold-glow);">✦ ALL CONTRACTS SEALED (+100 XP Bonus) ✦</span>
        ` : `
          <span class="ui-label" style="color: var(--accent-red); font-size: 0.75rem;">Contracts reset at midnight</span>
        `}
      </div>

      <!-- Hydration Quest Widget -->
      <div class="hydration-widget">
        <div class="hydration-header-row">
          <div style="display: flex; flex-direction: column;">
            <h4 style="font-family: 'Cinzel'; margin: 0; color: var(--text-cream); font-size: 1.15rem;">Daily Hydration Quest</h4>
            <span class="ui-label" style="font-size: 0.65rem; color: var(--text-muted); margin-top: 0.15rem;">Goal: Drink 2 Liters (2000 ml)</span>
          </div>
          <span style="font-family: 'Inter'; font-size: 0.8rem; color: var(--accent-gold); font-weight: bold;">+40 XP</span>
        </div>
        
        <div class="quest-progress-row">
          <div class="quest-bar-outer">
            <div class="quest-bar-inner" style="width: ${Math.min(100, hydrationPct)}%; background-color: ${playerState.hydrationCompleted ? '#4c914c' : 'var(--accent-gold)'};"></div>
          </div>
          <span style="font-family: 'Inter'; font-size: 0.8rem; color: var(--text-cream); font-weight: bold; width: 80px; text-align: right;">
            ${playerState.hydrationToday} / 2000 ml
          </span>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem;">
          <span class="ui-label" style="font-size: 0.65rem; color: ${playerState.hydrationCompleted ? '#4c914c' : 'var(--text-muted)'}; font-weight: bold;">
            ${playerState.hydrationCompleted ? '✦ Goal Completed ✦' : 'Keep hydrating to seal this pact'}
          </span>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn-quick-add" id="btn-add-250" ${playerState.hydrationCompleted ? 'disabled' : ''}>+250 ml</button>
            <button class="btn-quick-add" id="btn-add-500" ${playerState.hydrationCompleted ? 'disabled' : ''}>+500 ml</button>
          </div>
        </div>
      </div>

      <!-- Daily Crow Fact Box -->
      <div class="crow-fact-card">
        <!-- Watermark Feather SVG -->
        <svg class="crow-watermark" viewBox="0 0 24 24">
          <path d="M12,2A10,10 0 0,0 2,12C2,14.4 2.85,16.6 4.26,18.33L12,10.6L19.74,18.33C21.15,16.6 22,14.4 22,12A10,10 0 0,0 12,2M12,12.7L5.67,19.03C7.38,20.89 9.56,22 12,22C14.44,22 16.62,20.89 18.33,19.03L12,12.7Z" />
        </svg>
        <h4 style="font-family: 'Cinzel'; margin: 0 0 0.5rem 0; color: var(--accent-gold); font-size: 1.05rem; letter-spacing: 0.05em;">✦ Daily Corvid Oracle ✦</h4>
        <p style="font-family: 'EB Garamond'; font-size: 1.15rem; line-height: 1.5; color: var(--text-cream); margin: 0; position: relative; z-index: 2;">
          "${playerState.lastCrowFactText || 'Wird geladen...'}"
        </p>
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

  // Bind Hydration Buttons
  document.getElementById("btn-add-250")?.addEventListener("click", () => {
    addHydration(250);
    renderQuestBoard(container);
  });
  document.getElementById("btn-add-500")?.addEventListener("click", () => {
    addHydration(500);
    renderQuestBoard(container);
  });
}

function rerollQuest(idx, container) {
  if (playerState.questRerollsToday >= 2) return;
  
  const activeIds = playerState.questsToday.map(q => q.id);
  const availablePool = QUEST_POOL.filter(q => !activeIds.includes(q.id));
  
  if (availablePool.length === 0) return;
  
  const newQuest = availablePool[Math.floor(Math.random() * availablePool.length)];
  
  playerState.questsToday[idx] = {
    ...newQuest,
    current: 0,
    completed: false
  };
  
  playerState.questRerollsToday++;
  savePlayerState();
  
  renderQuestBoard(container);
}

// Global Event Listeners to advance quest progress
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
    
    addXp(quest.xpReward);
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
    
    addXp(100);
    
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
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 250;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    particle.style.setProperty("--tx", `${tx}px`);
    particle.style.setProperty("--ty", `${ty}px`);
    
    const color = Math.random() > 0.5 ? "var(--accent-gold)" : "var(--accent-red)";
    particle.style.backgroundColor = color;
    
    particle.style.left = `${originX}px`;
    particle.style.top = `${originY}px`;
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 1200);
  }
  
  // Sound effect
  playTriumphChime();
}

function playTriumphChime() {
  try {
    // Check master sound
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
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
