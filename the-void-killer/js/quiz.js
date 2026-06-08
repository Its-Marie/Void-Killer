// The Void Killer - Parasitology Quiz Engine

import { callGeminiApi, isOfflineMode } from './api.js';
import { addXp, incrementDiagnosedCount } from './gamification.js';
import { PARASITES, FALLBACK_QUESTIONS, renderParasiteCard } from './bestiary.js';

let currentDifficulty = "Resident"; // Resident, Fellow, Attending
let currentQuestion = null;
let preloadedQuestion = null;
let isPreloading = false;
let quizContainer = null;

const DIFFICULTY_XP = {
  "Resident": 50,
  "Fellow": 100,
  "Attending": 150
};

// Custom Styles for Quiz Elements
function injectQuizStyles() {
  const styleId = "quiz-styles";
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .quiz-view-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .difficulty-select-box {
      background-color: var(--surface-inner);
      border: 1px solid var(--border-gold-dim);
      padding: 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .diff-btns-row {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .quiz-card-wrapper {
      margin-top: 1.5rem;
      animation: fadeIn 0.4s ease;
    }
    
    /* Baldur's Gate choice styling */
    .choices-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1.5rem;
      list-style: none;
    }
    
    .choice-btn {
      width: 100%;
      text-align: left;
      background-color: var(--surface-inner);
      border: 1px solid var(--border-gold-dim);
      color: var(--text-cream);
      padding: 0.85rem 1.25rem;
      cursor: pointer;
      font-family: 'Cinzel', serif;
      font-size: 0.95rem;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .choice-btn:hover:not(:disabled) {
      border-color: var(--accent-gold);
      box-shadow: 0 0 12px var(--accent-gold-glow);
      background-color: #241c14;
    }
    
    .choice-btn .choice-num {
      color: var(--accent-red);
      font-weight: bold;
    }
    .choice-btn:hover .choice-num {
      color: var(--accent-gold);
    }
    
    /* Answer states */
    .choice-btn.correct {
      border-color: #4c914c !important;
      background-color: #172d17 !important;
      color: #ccffcc !important;
      box-shadow: 0 0 10px rgba(76,145,76,0.3);
    }
    .choice-btn.incorrect {
      border-color: var(--accent-red) !important;
      background-color: #2e1414 !important;
      color: #ffcccc !important;
      box-shadow: 0 0 10px var(--accent-red-glow);
    }
    
    /* Explanation Box */
    .explanation-box {
      background-color: var(--surface-inner);
      border: double 4px var(--border-gold);
      padding: 1.5rem;
      margin-top: 1.5rem;
      animation: slideDown 0.3s ease forwards;
    }
    
    .explanation-box::before {
      content: "";
      position: absolute;
      border: 1px solid var(--border-gold-dim);
      pointer-events: none;
    }
    
    .card-unlock-alert {
      display: flex;
      background-color: #262118;
      border: 1px solid var(--border-gold);
      padding: 1rem;
      gap: 1rem;
      align-items: center;
      margin-top: 1rem;
    }
    
    .loader-box {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 3rem;
      color: var(--text-muted);
      font-family: 'Cinzel';
      gap: 1rem;
    }
    
    .spinner-grim {
      width: 40px;
      height: 40px;
      border: 3px stroke var(--border-gold-dim);
      border-top: 3px solid var(--accent-gold);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export function initQuizView(container) {
  injectQuizStyles();
  quizContainer = container;
  
  // Clean states
  currentQuestion = null;
  preloadedQuestion = null;
  isPreloading = false;
  
  renderDifficultySelection();
}

function renderDifficultySelection() {
  quizContainer.innerHTML = `
    <div class="quiz-view-container">
      <div class="difficulty-select-box">
        <h3 style="font-family: 'Cinzel'; color: var(--accent-gold);">Select Vignette Difficulty</h3>
        <p style="color: var(--text-cream); font-family: 'EB Garamond'; font-size: 1.25rem;">
          Higher tiers yield greater knowledge (XP) and unlock rarer specimen cards for your Bestiary collection.
        </p>
        <div class="diff-btns-row">
          <button class="btn-stone" data-diff="Resident">Resident (50 XP)</button>
          <button class="btn-stone" data-diff="Fellow">Fellow (100 XP)</button>
          <button class="btn-stone" data-diff="Attending">Attending (150 XP)</button>
        </div>
      </div>
    </div>
  `;
  
  quizContainer.querySelectorAll(".diff-btns-row button").forEach(btn => {
    btn.addEventListener("click", (e) => {
      currentDifficulty = e.currentTarget.dataset.diff;
      startQuizRound();
    });
  });
}

async function startQuizRound() {
  quizContainer.innerHTML = `
    <div class="loader-box">
      <div class="spinner-grim"></div>
      <span>Consulting Ancient Parasitology Archives...</span>
    </div>
  `;
  
  try {
    currentQuestion = await fetchQuestion(currentDifficulty);
    renderQuestion(currentQuestion);
    
    // Background preload the next question immediately
    preloadNextQuestion();
  } catch (err) {
    console.error("Failed to load question:", err);
    quizContainer.innerHTML = `
      <div class="quiz-view-container" style="text-align: center; padding: 2rem;">
        <h3 style="color: var(--accent-red);">Archive Failure</h3>
        <p style="margin-bottom: 2rem;">Failed to fetch clinical case. Verify your API Key or try again.</p>
        <button class="btn-stone" id="btn-quiz-retry">Return to Tiers</button>
      </div>
    `;
    document.getElementById("btn-quiz-retry")?.addEventListener("click", renderDifficultySelection);
  }
}

// Renders the case vignette inside a scroll parchment box
function renderQuestion(q) {
  quizContainer.innerHTML = `
    <div class="quiz-view-container">
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <span class="ui-label" style="color: var(--accent-gold); font-weight: bold;">Pathology Case Vignette — ${currentDifficulty}</span>
        <button class="btn-stone" id="btn-change-diff" style="font-size: 0.7rem; padding: 0.3rem 0.6rem;">Change Tier</button>
      </div>
      
      <!-- Vignette Scroll Box -->
      <div class="parchment-scroll">
        <p>${q.case}</p>
        <!-- Wax Seal Icon -->
        <svg class="wax-seal" viewBox="0 0 100 100" id="wax-seal-btn" title="Wax Seal of Research">
          <circle cx="50" cy="50" r="40" fill="#8b1a1a" stroke="#520b0b" stroke-width="3" />
          <path d="M40,35 C50,25 60,35 50,50 C40,65 50,75 60,65" fill="none" stroke="#e8dcc8" stroke-width="4" stroke-linecap="round" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="#700f0f" stroke-width="1" stroke-dasharray="3 3" />
        </svg>
      </div>

      <!-- Multiple Choice Options -->
      <ul class="choices-list">
        ${q.options.map((opt, idx) => `
          <li>
            <button class="choice-btn" data-idx="${idx}">
              <span class="choice-num">[${idx + 1}]</span>
              <span class="choice-text">${opt}</span>
            </button>
          </li>
        `).join('')}
      </ul>

      <!-- Result Frame (Hidden initially) -->
      <div id="quiz-result-area" style="display: none;"></div>
    </div>
  `;
  
  // Bind change difficulty
  document.getElementById("btn-change-diff").addEventListener("click", renderDifficultySelection);
  
  // Bind choice buttons
  const choiceBtns = quizContainer.querySelectorAll(".choices-list button");
  choiceBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const selectedIdx = parseInt(e.currentTarget.dataset.idx);
      handleAnswer(selectedIdx, choiceBtns);
    });
  });
  
  // Visual click on wax seal reveals hint
  document.getElementById("wax-seal-btn").addEventListener("click", () => {
    alert(`Rarity Hint: This specimen card belongs to the ${q.rarity.toUpperCase()} tier.`);
  });
}

function handleAnswer(selectedIdx, choiceBtns) {
  // Disable all choice buttons
  choiceBtns.forEach(btn => btn.disabled = true);
  
  const isCorrect = (selectedIdx === currentQuestion.correct);
  const correctBtn = quizContainer.querySelector(`.choice-btn[data-idx="${currentQuestion.correct}"]`);
  correctBtn.classList.add("correct");
  
  if (!isCorrect) {
    const selectedBtn = quizContainer.querySelector(`.choice-btn[data-idx="${selectedIdx}"]`);
    selectedBtn.classList.add("incorrect");
  }
  
  // Award XP and unlocks
  const xpReward = DIFFICULTY_XP[currentDifficulty];
  let cardUnlocked = false;
  let unlockedParasite = null;
  
  if (isCorrect) {
    addXp(xpReward);
    incrementDiagnosedCount();
    
    // Dispatch custom event for quests
    window.dispatchEvent(new CustomEvent("quiz-correct-answer", {
      detail: {
        difficulty: currentDifficulty,
        parasiteRarity: currentQuestion.rarity || 'common'
      }
    }));
    
    // Unlock card in collection
    // Map question parasite string to local parasite ID
    unlockedParasite = PARASITES.find(p => p.name.toLowerCase().includes(currentQuestion.parasite.toLowerCase()) || currentQuestion.parasite.toLowerCase().includes(p.name.toLowerCase()));
    
    if (unlockedParasite) {
      if (!playerState.cardCollection.includes(unlockedParasite.id)) {
        playerState.cardCollection.push(unlockedParasite.id);
        savePlayerState();
        cardUnlocked = true;
      }
    }
  }
  
  // Reveal explanation and Next button
  const resultArea = document.getElementById("quiz-result-area");
  resultArea.style.display = "block";
  resultArea.innerHTML = `
    <div class="explanation-box">
      <h4 style="font-family: 'Cinzel'; color: ${isCorrect ? '#4c914c' : 'var(--accent-red)'}; margin-bottom: 0.5rem;">
        ${isCorrect ? `✦ RECTITUDE (+${xpReward} XP) ✦` : "✦ FALSE SPECULATION ✦"}
      </h4>
      <p style="font-size: 1.1rem; line-height: 1.5; color: var(--text-cream); margin-bottom: 1rem;">
        <strong>Correct: ${currentQuestion.options[currentQuestion.correct]}</strong>
      </p>
      <p style="font-size: 1.05rem; line-height: 1.5; color: var(--text-muted); font-family: 'EB Garamond';">
        ${currentQuestion.explanation}
      </p>
      
      ${cardUnlocked ? `
        <div class="card-unlock-alert">
          <div style="width: 70px; height: 90px; flex-shrink: 0;">
            ${unlockedParasite.svg}
          </div>
          <div>
            <span class="ui-label" style="color: var(--accent-gold); font-size: 0.7rem;">✦ Card Binding Successful ✦</span>
            <h5 style="margin: 0; color: var(--text-cream); font-family: 'Cinzel';">${unlockedParasite.name}</h5>
            <p style="margin: 0.25rem 0 0 0; font-size: 0.8rem; color: var(--text-muted);">Added to Parasite Bestiary collection.</p>
          </div>
        </div>
      ` : ''}
      
      <div style="display: flex; justify-content: flex-end; margin-top: 1.5rem;">
        <button class="btn-stone" id="btn-quiz-next">
          ${isPreloading ? "Wait for Archives..." : "Next Case ✦"}
        </button>
      </div>
    </div>
  `;
  
  const nextBtn = document.getElementById("btn-quiz-next");
  
  if (isPreloading) {
    nextBtn.disabled = true;
    // Wait for preloader
    checkPreloadReady(nextBtn);
  } else {
    bindNextButton(nextBtn);
  }
}

function checkPreloadReady(btn) {
  const check = setInterval(() => {
    if (!isPreloading) {
      clearInterval(check);
      btn.disabled = false;
      btn.textContent = "Next Case ✦";
      bindNextButton(btn);
    }
  }, 100);
}

function bindNextButton(btn) {
  btn.addEventListener("click", () => {
    if (preloadedQuestion) {
      currentQuestion = preloadedQuestion;
      preloadedQuestion = null;
      renderQuestion(currentQuestion);
      preloadNextQuestion();
    } else {
      // Preload failed or hasn't run, fetch synchronously
      startQuizRound();
    }
  });
}

// API Fetch & Offline Fallbacks
async function fetchQuestion(difficulty) {
  if (isOfflineMode()) {
    return fetchOfflineQuestion(difficulty);
  }
  
  const prompt = `You are a parasitology professor at a research university. Generate a clinical case vignette quiz question at ${difficulty} level. Return ONLY valid JSON, no markdown, no extra text: { case: string (2-4 sentences: patient age, geographic origin, specific symptoms, lab findings), options: [string, string, string, string], correct: number (0-3), explanation: string (cover parasite lifecycle, pathophysiology, why each wrong answer is incorrect), parasite: string, rarity: 'common'|'rare'|'legendary' }. Difficulty levels: Resident (classic presentations), Fellow (atypical cases, co-infections), Attending (rare parasites, complex immunocompromised patients).`;
  
  try {
    const data = await callGeminiApi(prompt);
    // Validate response shape
    if (data.case && data.options && Array.isArray(data.options) && typeof data.correct === 'number') {
      return data;
    }
    throw new Error("Invalid question structure returned by Gemini API");
  } catch (e) {
    console.warn("Gemini API quiz failure, drawing from fallback library:", e);
    return fetchOfflineQuestion(difficulty);
  }
}

function fetchOfflineQuestion(difficulty) {
  // Filter fallbacks by approximate difficulty
  let candidates = FALLBACK_QUESTIONS;
  if (difficulty === "Resident") {
    // Return early elements
    candidates = FALLBACK_QUESTIONS.slice(0, 10);
  } else {
    candidates = FALLBACK_QUESTIONS.slice(10);
  }
  
  // Pick random candidate
  const idx = Math.floor(Math.random() * candidates.length);
  return JSON.parse(JSON.stringify(candidates[idx])); // Clone
}

// Background preloader
async function preloadNextQuestion() {
  isPreloading = true;
  try {
    preloadedQuestion = await fetchQuestion(currentDifficulty);
  } catch (e) {
    console.warn("Failed to background-preload question:", e);
  } finally {
    isPreloading = false;
    
    // Update button text if currently showing results
    const nextBtn = document.getElementById("btn-quiz-next");
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.textContent = "Next Case ✦";
      bindNextButton(nextBtn);
    }
  }
}
