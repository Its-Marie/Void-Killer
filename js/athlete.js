// The Void Killer - Desk Athlete Module

import { EXERCISES } from './exercises.js';
import { addXp, playerState, savePlayerState } from './gamification.js';

let routineQueue = [];
let activeExerciseIdx = 0;
let timeRemaining = 0;
let isPaused = false;
let athleteInterval = null;
let activeContainer = null;
let currentMode = "selection"; // selection, playing, transitioning, complete, browsing
let isSingleExercise = false;
let sessionTotalSeconds = 0;

// Custom CSS for Desk Athlete
function injectAthleteStyles() {
  const styleId = "athlete-styles";
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .athlete-layout {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .timer-circle-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 1.5rem 0;
    }
    
    .timer-display-box {
      width: 160px;
      height: 160px;
      border-radius: 50%;
      border: double 6px var(--border-gold);
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      box-shadow: 0 0 20px var(--accent-gold-glow);
      background-color: var(--surface-inner);
    }
    
    .timer-seconds {
      font-size: 3rem;
      font-family: 'Cinzel', serif;
      color: var(--accent-gold);
      font-weight: 800;
      line-height: 1;
    }
    
    .exercise-list-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    
    @media(min-width: 650px) {
      .exercise-list-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    
    .exercise-card {
      background-color: var(--surface-inner);
      border: 1px solid var(--border-gold-dim);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1rem;
    }
    
    .exercise-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-bottom: 1px solid var(--border-gold-dim);
      padding-bottom: 0.35rem;
    }
    
    .exercise-name {
      font-family: 'Cinzel', serif;
      font-size: 1.1rem;
      color: var(--text-cream);
    }
    
    .exercise-part-tag {
      font-size: 0.65rem;
      color: var(--accent-gold);
      border: 1px solid var(--border-gold-dim);
      padding: 0.1rem 0.4rem;
    }
  `;
  document.head.appendChild(style);
}

function saveAthleteSession() {
  playerState.athleteSessionState = {
    active: routineQueue.length > 0,
    routineQueueIds: routineQueue.map(e => e.id),
    activeExerciseIdx: activeExerciseIdx,
    timeRemaining: timeRemaining,
    isPaused: isPaused,
    isStarted: athleteInterval !== null && !isPaused,
    isSingleExercise: isSingleExercise,
    sessionTotalSeconds: sessionTotalSeconds
  };
  savePlayerState();
}

function clearAthleteSession() {
  playerState.athleteSessionState = null;
  savePlayerState();
}

export function initAthleteView(container) {
  injectAthleteStyles();
  activeContainer = container;
  
  // Clean states
  clearInterval(athleteInterval);
  routineQueue = [];
  activeExerciseIdx = 0;
  isPaused = false;
  
  // Check for restored state
  if (playerState.athleteSessionState && playerState.athleteSessionState.active) {
    const state = playerState.athleteSessionState;
    routineQueue = state.routineQueueIds.map(id => EXERCISES.find(e => e.id === id)).filter(Boolean);
    activeExerciseIdx = state.activeExerciseIdx;
    timeRemaining = state.timeRemaining;
    isPaused = state.isPaused;
    isSingleExercise = state.isSingleExercise;
    sessionTotalSeconds = state.sessionTotalSeconds;
    
    const ex = routineQueue[activeExerciseIdx];
    if (ex) {
      renderActivePlayer(ex, state.isStarted);
      if (state.isStarted) {
        startTimerLoop();
      }
      return;
    }
  }
  
  renderSelectionView();
}

function renderSelectionView() {
  currentMode = "selection";
  activeContainer.innerHTML = `
    <div class="athlete-layout" style="text-align: center; padding: 1rem 0;">
      <h3 style="font-family: 'Cinzel'; color: var(--accent-gold);">Desk Athlete Training</h3>
      <p style="color: var(--text-cream); font-family: 'EB Garamond'; font-size: 1.25rem; margin-bottom: 2rem;">
        Prevent stiffness, improve blood circulation, and protect your back. Generate a fast 4–5 exercise routine or browse the individual archive library.
      </p>
      
      <div style="display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 2rem;">
        <button class="btn-stone" id="btn-start-routine" style="font-size: 1.1rem; padding: 0.8rem 1.8rem;">
          Generate Micro-Routine (30 XP)
        </button>
        <button class="btn-stone" id="btn-browse-exercises" style="font-size: 1.1rem; padding: 0.8rem 1.8rem;">
          Browse All Exercises
        </button>
      </div>
    </div>
  `;
  
  document.getElementById("btn-start-routine").addEventListener("click", startMicroRoutine);
  document.getElementById("btn-browse-exercises").addEventListener("click", renderBrowseView);
}

function startMicroRoutine() {
  // Pick 4-5 random exercises
  const count = 4 + Math.floor(Math.random() * 2); // 4 or 5
  routineQueue = [...EXERCISES].sort(() => 0.5 - Math.random()).slice(0, count);
  activeExerciseIdx = 0;
  isSingleExercise = false;
  sessionTotalSeconds = routineQueue.reduce((acc, curr) => acc + curr.duration, 0);
  
  playChime("start");
  loadExercise(activeExerciseIdx);
}

function loadExercise(idx) {
  const ex = routineQueue[idx];
  if (!ex) {
    // Finished all exercises!
    completeRoutine();
    return;
  }
  
  currentMode = "playing";
  timeRemaining = ex.duration;
  isPaused = false;
  
  saveAthleteSession();
  renderActivePlayer(ex, false); // start as not started yet
}

function renderActivePlayer(ex, isStarted = false) {
  currentMode = "playing";
  
  activeContainer.innerHTML = `
    <div class="athlete-layout" style="text-align: center;">
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <span class="leitner-status-badge">
          ${isSingleExercise ? "Single Practice" : `Exercise ${activeExerciseIdx + 1} / ${routineQueue.length}`}
        </span>
        <span class="exercise-part-tag">${ex.bodyPart}</span>
      </div>
      
      <h3 style="font-family: 'Cinzel'; color: var(--text-cream); margin-top: 1rem;">${ex.name}</h3>
      
      <div class="timer-circle-container">
        <div class="timer-display-box">
          <span class="timer-seconds" id="timer-number">${timeRemaining}</span>
          <span class="ui-label" style="font-size: 0.65rem; color: var(--text-muted); margin-top: 0.25rem;">Seconds</span>
        </div>
      </div>
      
      <p style="font-family: 'EB Garamond'; font-size: 1.35rem; line-height: 1.6; max-width: 600px; margin: 0 auto 2rem auto; min-height: 80px;">
        ${ex.description}
      </p>
      
      <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;" id="athlete-controls-row">
        ${!isStarted ? `
          <button class="btn-stone" id="btn-player-start" style="border-color: var(--accent-gold); box-shadow: 0 0 8px var(--accent-gold-glow);">Start Exercise</button>
        ` : `
          <button class="btn-stone" id="btn-player-pause">${isPaused ? 'Resume' : 'Pause'}</button>
          <button class="btn-stone" id="btn-player-restart">Restart</button>
        `}
        ${!isSingleExercise ? `
          <button class="btn-stone" id="btn-player-skip">Skip</button>
        ` : ''}
        <button class="btn-stone danger" id="btn-player-quit">Exit Routine</button>
      </div>
    </div>
  `;
  
  if (!isStarted) {
    document.getElementById("btn-player-start").addEventListener("click", () => {
      startTimerLoop();
      renderActivePlayer(ex, true);
    });
  } else {
    document.getElementById("btn-player-pause").addEventListener("click", togglePause);
    document.getElementById("btn-player-restart").addEventListener("click", () => {
      clearInterval(athleteInterval);
      timeRemaining = ex.duration;
      isPaused = false;
      document.getElementById("timer-number").textContent = timeRemaining;
      saveAthleteSession();
      startTimerLoop();
      renderActivePlayer(ex, true);
    });
  }
  
  if (!isSingleExercise) {
    document.getElementById("btn-player-skip").addEventListener("click", skipExercise);
  }
  document.getElementById("btn-player-quit").addEventListener("click", quitRoutine);
}

function startTimerLoop() {
  clearInterval(athleteInterval);
  saveAthleteSession();
  
  athleteInterval = setInterval(() => {
    if (isPaused) return;
    
    timeRemaining--;
    
    // Update number
    const numEl = document.getElementById("timer-number");
    if (numEl) numEl.textContent = timeRemaining;
    
    saveAthleteSession();
    
    // Play subtle tick on last 3 seconds
    if (timeRemaining > 0 && timeRemaining <= 3) {
      playChime("tick");
    }
    
    if (timeRemaining <= 0) {
      clearInterval(athleteInterval);
      playChime("tick");
      
      if (isSingleExercise) {
        completeSingleExercise();
      } else {
        triggerTransition();
      }
    }
  }, 1000);
}

function togglePause() {
  isPaused = !isPaused;
  const btn = document.getElementById("btn-player-pause");
  if (btn) {
    btn.textContent = isPaused ? "Resume" : "Pause";
  }
  saveAthleteSession();
}

function skipExercise() {
  clearInterval(athleteInterval);
  activeExerciseIdx++;
  loadExercise(activeExerciseIdx);
}

function quitRoutine() {
  if (confirm("Are you sure you want to stop your routine? Progress will be lost.")) {
    clearInterval(athleteInterval);
    clearAthleteSession();
    renderSelectionView();
  }
}

// Intermediary transition phase for breathing / stretch preparation
function triggerTransition() {
  currentMode = "transitioning";
  let transitionTime = 4;
  clearAthleteSession();
  
  activeContainer.innerHTML = `
    <div class="athlete-layout" style="text-align: center; justify-content: center; min-height: 400px;">
      <h3 style="font-family: 'Cinzel'; color: var(--accent-gold);">Prepare For Next Stretch</h3>
      <div class="timer-circle-container">
        <div class="timer-display-box" style="width: 120px; height: 120px; border-color: var(--accent-red);">
          <span class="timer-seconds" id="transition-number" style="font-size: 2.5rem; color: var(--accent-red);">${transitionTime}</span>
        </div>
      </div>
      <p style="color: var(--text-muted); font-size: 1.15rem;">
        Take a deep breath and adjust your posture.
      </p>
    </div>
  `;
  
  athleteInterval = setInterval(() => {
    transitionTime--;
    const numEl = document.getElementById("transition-number");
    if (numEl) numEl.textContent = transitionTime;
    
    if (transitionTime <= 0) {
      clearInterval(athleteInterval);
      activeExerciseIdx++;
      playChime("start");
      loadExercise(activeExerciseIdx);
    }
  }, 1000);
}

function completeRoutine() {
  currentMode = "complete";
  clearInterval(athleteInterval);
  clearAthleteSession();
  
  addXp(30); // 30 XP
  
  // Dispatch completed event for quests
  window.dispatchEvent(new CustomEvent("athlete-routine-completed", {
    detail: { durationSeconds: sessionTotalSeconds }
  }));
  
  playChime("victory");
  
  activeContainer.innerHTML = `
    <div class="athlete-layout" style="text-align: center; padding: 2rem 0;">
      <h2 style="font-family: 'Cinzel'; color: var(--accent-gold); margin-bottom: 1rem;">ROUTINE SEALED</h2>
      <p style="font-family: 'EB Garamond'; font-size: 1.35rem; color: var(--text-cream); margin-bottom: 2rem;">
        Your spine feels elongated, your muscles are re-oxygenated, and your focus is sharpened.
      </p>
      
      <div style="background-color: var(--surface-inner); border: double 4px var(--border-gold); padding: 1.5rem; max-width: 450px; margin: 0 auto 2.5rem auto;">
        <span class="ui-label" style="color: var(--accent-gold);">Pact Accomplished (+30 XP)</span>
        <div style="display: flex; justify-content: space-around; margin-top: 1rem; font-family: 'Cinzel';">
          <div>
            <span style="font-size: 1.5rem; color: var(--text-cream); display: block;">${routineQueue.length}</span>
            <span class="ui-label" style="font-size: 0.6rem; color: var(--text-muted);">Exercises</span>
          </div>
          <div>
            <span style="font-size: 1.5rem; color: var(--text-cream); display: block;">${sessionTotalSeconds}s</span>
            <span class="ui-label" style="font-size: 0.6rem; color: var(--text-muted);">Duration</span>
          </div>
        </div>
      </div>
      
      <button class="btn-stone" id="btn-finish-athlete-session">Acknowledge</button>
    </div>
  `;
  
  document.getElementById("btn-finish-athlete-session").addEventListener("click", renderSelectionView);
}

function completeSingleExercise() {
  currentMode = "complete";
  clearInterval(athleteInterval);
  clearAthleteSession();
  
  addXp(10); // 10 XP for single
  
  window.dispatchEvent(new CustomEvent("athlete-routine-completed", {
    detail: { durationSeconds: sessionTotalSeconds } // just the single stretch duration
  }));
  
  playChime("victory");
  
  activeContainer.innerHTML = `
    <div class="athlete-layout" style="text-align: center; padding: 2rem 0;">
      <h3 style="font-family: 'Cinzel'; color: var(--accent-gold); margin-bottom: 1rem;">STRETCH COMPLETE</h3>
      <p style="font-family: 'EB Garamond'; font-size: 1.25rem; color: var(--text-cream); margin-bottom: 2rem;">
        You have successfully performed this individual practice.
      </p>
      <button class="btn-stone" id="btn-finish-single-athlete">Return to Library</button>
    </div>
  `;
  
  document.getElementById("btn-finish-single-athlete").addEventListener("click", renderBrowseView);
}

// Browse View (Lists all 15 Exercises)
function renderBrowseView() {
  currentMode = "browsing";
  activeContainer.innerHTML = `
    <div class="athlete-layout">
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <h3 style="font-family: 'Cinzel'; color: var(--accent-gold);">Exercise Codex</h3>
        <button class="btn-stone" id="btn-back-selection" style="font-size: 0.75rem; padding: 0.35rem 0.75rem;">Back to Setup</button>
      </div>
      
      <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 1rem;">
        Select any stretch to practice individually for <strong>+10 XP</strong>.
      </p>
      
      <div class="exercise-list-grid">
        ${EXERCISES.map((ex, idx) => `
          <div class="exercise-card">
            <div class="exercise-info">
              <div class="exercise-header">
                <span class="exercise-name">${ex.name}</span>
                <span class="exercise-part-tag">${ex.bodyPart}</span>
              </div>
              <p style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.75rem; line-height: 1.4; font-family: 'EB Garamond';">
                ${ex.description}
              </p>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #2e261e; padding-top: 0.75rem; margin-top: 0.5rem;">
              <span style="font-family: 'Inter'; font-size: 0.75rem; color: var(--accent-gold); font-weight: bold;">
                ${ex.duration} Seconds
              </span>
              <button class="btn-stone btn-run-single" data-idx="${idx}" style="font-size: 0.7rem; padding: 0.35rem 0.6rem;">
                Begin Practice
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  document.getElementById("btn-back-selection").addEventListener("click", renderSelectionView);
  
  activeContainer.querySelectorAll(".btn-run-single").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.currentTarget.dataset.idx);
      const ex = EXERCISES[idx];
      
      routineQueue = [ex];
      activeExerciseIdx = 0;
      isSingleExercise = true;
      sessionTotalSeconds = ex.duration;
      
      playChime("start");
      loadExercise(0);
    });
  });
}

// Audio Chime Synthesizer using Web Audio API
function playChime(type) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    if (type === "tick") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.08, now + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "start") {
      // Warm rising fifths
      const freqs = [349.23, 523.25]; // F4, C5
      freqs.forEach((freq, idx) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        
        o.type = "triangle";
        o.frequency.setValueAtTime(freq, now + idx * 0.1);
        
        const noteStart = now + idx * 0.1;
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.12, noteStart + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.4);
        
        o.connect(g);
        g.connect(audioCtx.destination);
        
        o.start(noteStart);
        o.stop(noteStart + 0.5);
      });
    } else if (type === "victory") {
      // Warm major 7th chord arpeggio
      const freqs = [261.63, 329.63, 392.00, 493.88, 523.25]; // C4, E4, G4, B4, C5
      freqs.forEach((freq, idx) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        
        o.type = "sine";
        o.frequency.setValueAtTime(freq, now + idx * 0.08);
        
        const noteStart = now + idx * 0.08;
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.1, noteStart + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, noteStart + 1.2);
        
        o.connect(g);
        g.connect(audioCtx.destination);
        
        o.start(noteStart);
        o.stop(noteStart + 1.5);
      });
    }
  } catch (e) {
    console.warn("Audio Context blocked or failed:", e);
  }
}
