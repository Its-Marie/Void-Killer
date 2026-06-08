// The Void Killer - Icelandic Language Trainer

import { callGeminiApi, isOfflineMode } from './api.js';
import { addXp, playerState, savePlayerState, updateMasteredWords } from './gamification.js';

// Normalization and Keyboard helpers for non-Icelandic keyboards
function normalizeIcelandic(str) {
  if (!str) return "";
  return str.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // removes accents (á->a, é->e, etc)
    .replace(/ð/g, "d")
    .replace(/þ/g, "th")
    .replace(/æ/g, "ae")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]/g, "") // remove spaces/punctuation
    .trim();
}

function createCharBarHtml(targetInputId) {
  const chars = ['á', 'é', 'í', 'ó', 'ú', 'ý', 'þ', 'æ', 'ö', 'ð'];
  return `
    <div class="char-quick-bar" style="display:flex; gap:0.25rem; margin-top:0.4rem; flex-wrap:wrap;">
      ${chars.map(c => `
        <button class="btn-stone btn-char-insert" data-char="${c}" data-target="${targetInputId}" style="padding:0.25rem 0.5rem; font-size:0.9rem; font-family:'EB Garamond', serif; text-transform:none;">${c}</button>
      `).join('')}
    </div>
  `;
}

function bindCharBarEvents(container) {
  container.querySelectorAll(".btn-char-insert").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const char = e.currentTarget.getAttribute("data-char");
      const targetId = e.currentTarget.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (input) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const text = input.value;
        input.value = text.substring(0, start) + char + text.substring(end);
        input.selectionStart = input.selectionEnd = start + 1;
        input.focus();
      }
    });
  });
}

// Fallback Icelandic Dialogues for Offline mode
const FALLBACK_DIALOGUES = [
  {
    text_icelandic: "Maðurinn gengur í skóginn. Hann sér lítinn fugl á grein. Fuglinn syngur fallega. Maðurinn brosir og heldur áfram ferð sinni.",
    text_german: "Der Mann geht in den Wald. Er sieht einen kleinen Vögel auf einem Ast. Der Vogel singt schön. Der Mann lächelt und setzt seine Reise fort.",
    target_words: [
      { icelandic: "gengur", german: "geht", phonetic: "cen-kur", grammar_note: "Verb 'ganga' (gehen), 3. Person Singular Präsens.", case_explanation: "Akkusativ 'skóginn' (der Wald) wird nach 'í' verwendet, um Bewegung anzuzeigen." },
      { icelandic: "sér", german: "sieht", phonetic: "sjer", grammar_note: "Verb 'sjá' (sehen), 3. Person Singular Präsens.", case_explanation: "Akkusativ 'lítinn fugl' (kleiner Vogel) ist das direkte Objekt des Verbs 'sjá'." },
      { icelandic: "brosir", german: "lächelt", phonetic: "pro-sir", grammar_note: "Verb 'brosa' (lächeln), 3. Person Singular Präsens.", case_explanation: "Kein Fall regiert, da 'brosa' intransitiv ist." }
    ],
    difficulty: "beginner"
  },
  {
    text_icelandic: "Hún drekkur heitt kaffi á kaffihúsinu. Úti er kalt og rignir mikið. Hún les áhugaverða bók á meðan hún bíður eftir vini sínum.",
    text_german: "Sie trinkt heißen Kaffee im Café. Draußen ist es kalt und regnet stark. Sie liest ein interessantes Buch, während sie auf ihren Freund wartet.",
    target_words: [
      { icelandic: "drekkur", german: "trinkt", phonetic: "trehk-ur", grammar_note: "Verb 'drekka' (trinken), 3. Person Singular Präsens.", case_explanation: "Akkusativ 'heitt kaffi' (heißen Kaffee) ist das direkte Objekt des Verbs 'drekka'." },
      { icelandic: "kaffihúsinu", german: "Café", phonetic: "kahf-fi-hu-sih-nu", grammar_note: "Substantiv 'kaffihús' (Café) im Dativ Singular Neutrum mit bestimmtem Artikel.", case_explanation: "Dativ wird wegen der Präposition 'á' verwendet, die einen festen Ort angibt." },
      { icelandic: "bíður", german: "wartet", phonetic: "bweeth-ur", grammar_note: "Verb 'bíða' (warten), 3. Person Singular Präsens.", case_explanation: "Dativ 'vini sínum' (seinem Freund) wird wegen der Präposition 'eftir' (nach/auf) verlangt." }
    ],
    difficulty: "beginner"
  },
  {
    text_icelandic: "Börnin leika sér í garðinum. Þau hlaupa hratt og hlæja mikið. Stór hundur hleypur til þeirra en þau verða ekki hrædd.",
    text_german: "Die Kinder spielen im Garten. Sie rennen schnell und lachen viel. Ein großer Hund rennt zu ihnen, aber sie kriegen keine Angst.",
    target_words: [
      { icelandic: "leika", german: "spielen", phonetic: "ley-ka", grammar_note: "Verb 'leika' (spielen), 3. Person Plural Präsens.", case_explanation: "Dativ 'garðinum' (der Garten) steht nach 'í', da es einen Zustand/Ort anzeigt." },
      { icelandic: "hlaupa", german: "rennen", phonetic: "hloy-pah", grammar_note: "Verb 'hlaupa' (rennen), 3. Person Plural Präsens.", case_explanation: "Intransitives Bewegungsverb, keine Fallrektion." },
      { icelandic: "hrædd", german: "ängstlich / erschrocken", phonetic: "hritth", grammar_note: "Adjektiv 'hræddur' (ängstlich) im Nominativ Plural Neutrum.", case_explanation: "Nominativ wird als Prädikatsnomen nach dem Kopulaverb 'verða' verwendet." }
    ],
    difficulty: "intermediate"
  },
  {
    text_icelandic: "Stormurinn feykir laufunum um göturnar. Ég týndi vettlingunum mínum í snjónum. Ég þarf að kaupa nýja á morgun.",
    text_german: "Der Sturm bläst die Blätter über die Straßen. Ich habe meine Fäustlinge im Schnee verloren. Ich muss morgen neue kaufen.",
    target_words: [
      { icelandic: "feykir", german: "wegwehen / blasen", phonetic: "fey-kir", grammar_note: "Verb 'feykja' (wegwehen), 3. Person Singular Präsens.", case_explanation: "Dativ 'laufunum' (die Blätter) wird verwendet, da 'feykja' eine unkontrollierte Bewegung ausdrückt und Dativ regiert." },
      { icelandic: "týndi", german: "verlor", phonetic: "teen-dih", grammar_note: "Verb 'týna' (verlieren), 1. Person Singular Präteritum.", case_explanation: "Dativ 'vettlingunum mínum' (meine Fäustlinge), da 'týna' den Dativ regiert." },
      { icelandic: "snjónum", german: "Schnee", phonetic: "stnyoh-num", grammar_note: "Substantiv 'snjór' (Schnee) im Dativ Singular Maskulinum mit bestimmtem Artikel.", case_explanation: "Dativ wird wegen der Präposition 'í' (im) verlangt." }
    ],
    difficulty: "intermediate"
  },
  {
    text_icelandic: "Norðurljósin dansa á dimmum himni. Fólkið horfir á þau með mikilli undrun. Þetta er ógleymanlegt sjónarspil.",
    text_german: "Die Polarlichter tanzen am dunklen Himmel. Die Menschen betrachten sie mit großem Staunen. Das ist ein unvergessliches Schauspiel.",
    target_words: [
      { icelandic: "himni", german: "Himmel", phonetic: "him-nih", grammar_note: "Substantiv 'himinn' (Himmel) im Dativ Singular Maskulinum.", case_explanation: "Dativ wird wegen der Präposition 'á' (auf/am) verwendet." },
      { icelandic: "undrun", german: "Staunen", phonetic: "un-drun", grammar_note: "Substantiv 'undrun' (Staunen) im Dativ Singular Femininum.", case_explanation: "Dativ wird wegen der Präposition 'með' (mit) verwendet." },
      { icelandic: "ógleymanlegt", german: "unvergesslich", phonetic: "oh-kley-man-lecht", grammar_note: "Adjektiv 'ógleymanlegur' im Nominativ Singular Neutrum.", case_explanation: "Nominativ korrespondiert mit dem neutralen Substantiv 'sjónarspil'." }
    ],
    difficulty: "advanced"
  }
];

// Session variables
let sessionDueCards = [];
let sessionCurrentDialogue = null;
let sessionCompletedDialoguesCount = 0;
let phase = "start"; // start, due_review, phase1, phase2, phase3, session_complete
let activeContainer = null;
let timerInterval = null;
let timerSeconds = 0;
let sessionHadMistakes = false;

// Stats tracker
let statsSessionRead = 0;
let statsSessionWritten = 0;

// Custom CSS Injection for Icelandic trainer
function injectLanguageStyles() {
  const styleId = "icelandic-styles";
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .lang-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 850px;
      margin: 0 auto;
    }
    
    .leitner-status-badge {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      font-size: 0.7rem;
      background-color: var(--accent-gold);
      color: #000;
      border-radius: 1px;
      margin-bottom: 0.5rem;
      font-weight: bold;
    }
    
    .leitner-stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      text-align: center;
      margin-bottom: 1rem;
    }
    
    .leitner-box-widget {
      background-color: var(--surface-inner);
      border: 1px solid var(--border-gold-dim);
      padding: 0.75rem;
    }
    
    .leitner-box-widget .count {
      font-size: 1.5rem;
      font-family: 'Cinzel';
      color: var(--accent-gold);
      display: block;
    }
    
    .dialogue-split-view {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    
    @media(min-width: 768px) {
      .dialogue-split-view {
        grid-template-columns: 1fr 1fr;
      }
    }
    
    .dialogue-bubble {
      padding: 1.5rem;
      font-size: 1.35rem;
      line-height: 1.8;
      border-radius: 2px;
      position: relative;
    }
    
    .target-highlight {
      border-bottom: 2px dashed var(--accent-gold);
      color: var(--accent-gold);
      cursor: pointer;
      font-weight: 600;
      position: relative;
    }
    
    .target-highlight:hover {
      color: var(--text-cream);
      background-color: rgba(201, 168, 76, 0.1);
    }
    
    .reveal-timer-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: var(--surface-inner);
      padding: 0.75rem 1.25rem;
      border: 1px solid var(--border-gold-dim);
    }
    
    .vocabulary-legend {
      background-color: var(--surface-inner);
      border: 1px solid var(--border-gold-dim);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .word-card-inline {
      border-left: 3px solid var(--accent-gold);
      padding-left: 0.75rem;
    }
    
    /* Input-output diff colors */
    .diff-container {
      background-color: var(--surface-inner);
      border: 1px solid var(--border-gold-dim);
      padding: 1.25rem;
      font-size: 1.15rem;
    }
    
    .diff-wrong {
      color: #ff5555;
      text-decoration: line-through;
      margin-right: 0.4rem;
    }
    
    .diff-correct {
      color: var(--accent-gold);
      font-weight: bold;
      text-shadow: 0 0 5px var(--accent-gold-glow);
    }
  `;
  document.head.appendChild(style);
}

export function initLanguageView(container) {
  injectLanguageStyles();
  activeContainer = container;
  
  // Refresh Leitner Boxes arrays
  if (!playerState.leitnerBoxes) {
    playerState.leitnerBoxes = { box1: [], box2: [], box3: [] };
  }
  
  startSessionRouter();
}

function startSessionRouter() {
  // Check due cards
  sessionDueCards = getDueLeitnerCards();
  
  if (sessionDueCards.length > 0) {
    phase = "due_review";
    renderDueReview();
  } else {
    phase = "phase1";
    sessionCompletedDialoguesCount = 0;
    sessionHadMistakes = false;
    fetchNewDialogue();
  }
}

// Spaced Repetition card retrieval
function getDueLeitnerCards() {
  const due = [];
  const now = Date.now();
  
  // Gather from Box 1 & Box 2
  ["box1", "box2"].forEach(boxName => {
    const box = playerState.leitnerBoxes[boxName] || [];
    box.forEach(card => {
      if (!card.nextReviewTimestamp || now >= card.nextReviewTimestamp) {
        due.push({ ...card, sourceBox: boxName });
      }
    });
  });
  
  // Max 5 cards at beginning of session
  return due.sort((a,b) => a.nextReviewTimestamp - b.nextReviewTimestamp).slice(0, 5);
}

// Phase 2: Consolidation (Review Due Cards)
function renderDueReview() {
  const currentCardIdx = 0; // Always take the first due card
  const card = sessionDueCards[currentCardIdx];
  
  if (!card) {
    // Finished all due cards! Move to dialogue
    phase = "phase1";
    sessionCompletedDialoguesCount = 0;
    fetchNewDialogue();
    return;
  }
  
  activeContainer.innerHTML = `
    <div class="lang-container">
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <span class="leitner-status-badge">✦ Spaced Repetition Due (${sessionDueCards.length} left) ✦</span>
        <span class="ui-label" style="color: var(--text-muted);">Consolidation Phase</span>
      </div>
      
      <h3 style="font-family: 'Cinzel'; margin-bottom: 0.5rem;">Fill in the Blank</h3>
      <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 1.5rem;">
        Recall the target word in its correct inflected case based on the original sentence context.
      </p>

      <div class="parchment-scroll" style="font-size: 1.3rem; margin-bottom: 1.5rem;">
        ${card.sentenceWithBlank}
      </div>

      <div class="input-group">
        <label for="blank-input" class="ui-label">Target Icelandic Word:</label>
        <input type="text" id="blank-input" class="input-grimoire" autocomplete="off" autofocus placeholder="Enter word...">
        ${createCharBarHtml("blank-input")}
      </div>

      <div id="review-feedback-area" style="display: none; margin-bottom: 1.5rem;"></div>

      <div style="display:flex; justify-content: flex-end; gap: 1rem;">
        <button class="btn-stone" id="btn-reveal-hint">Reveal Hint</button>
        <button class="btn-stone" id="btn-submit-blank">Submit Answer</button>
      </div>
    </div>
  `;
  
  const hintBtn = document.getElementById("btn-reveal-hint");
  const submitBtn = document.getElementById("btn-submit-blank");
  const inputEl = document.getElementById("blank-input");
  const feedbackArea = document.getElementById("review-feedback-area");
  
  bindCharBarEvents(activeContainer);
  
  let hintShown = false;
  
  hintBtn.addEventListener("click", () => {
    if (hintShown) return;
    hintShown = true;
    hintBtn.disabled = true;
    alert(`Translation Hint: ${card.translation}\nGrammar: ${card.hints.grammar_note}`);
  });
  
  // Enter key press triggers submit
  inputEl.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      submitBtn.click();
    }
  });

  submitBtn.addEventListener("click", () => {
    if (submitBtn.textContent === "Next Due Card ✦") {
      sessionDueCards.shift();
      renderDueReview();
      return;
    }
    
    const userAns = normalizeIcelandic(inputEl.value);
    const correctAns = normalizeIcelandic(card.blankedWord);
    
    const isCorrect = (userAns === correctAns);
    
    feedbackArea.style.display = "block";
    
    if (isCorrect) {
      addXp(10); // 10 XP
      promoteLeitnerCard(card);
      window.dispatchEvent(new CustomEvent("leitner-card-reviewed", { detail: { isCorrect: true } }));
      feedbackArea.innerHTML = `
        <div class="explanation-box" style="margin-top: 0; border-color: #4c914c;">
          <h4 style="color: #4c914c; font-family: 'Cinzel';">✦ CORRECT (+10 XP) ✦</h4>
          <p style="font-family: 'EB Garamond'; color: var(--text-cream);">
            Excellent memory. The sentence reads: <strong>${card.sentence}</strong>
          </p>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.5rem;">
            Card promoted to higher review interval.
          </p>
        </div>
      `;
    } else {
      demoteLeitnerCard(card);
      window.dispatchEvent(new CustomEvent("leitner-card-reviewed", { detail: { isCorrect: false } }));
      feedbackArea.innerHTML = `
        <div class="explanation-box" style="margin-top: 0; border-color: var(--accent-red);">
          <h4 style="color: var(--accent-red); font-family: 'Cinzel';">✦ INCORRECT ✦</h4>
          <p style="font-family: 'EB Garamond'; color: var(--text-cream);">
            The correct spelling was: <strong style="color: var(--accent-gold);">${card.blankedWord}</strong>.
          </p>
          <p style="font-family: 'EB Garamond'; margin-top: 0.5rem;">
            Full context: <strong>${card.sentence}</strong>
          </p>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.5rem;">
            Card returned to Box 1 for immediate review.
          </p>
        </div>
      `;
    }
    
    inputEl.disabled = true;
    hintBtn.style.display = "none";
    submitBtn.textContent = "Next Due Card ✦";
  });
}

// Leitner system array modifications
function promoteLeitnerCard(card) {
  // Remove from current box
  const oldBox = card.sourceBox;
  playerState.leitnerBoxes[oldBox] = playerState.leitnerBoxes[oldBox].filter(c => c.id !== card.id);
  
  if (oldBox === "box1") {
    card.box = 2;
    card.nextReviewTimestamp = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 days
    playerState.leitnerBoxes.box2.push(card);
  } else if (oldBox === "box2") {
    card.box = 3;
    card.nextReviewTimestamp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    playerState.leitnerBoxes.box3.push(card);
    
    // Mastered word count
    const wordsMasteredCount = playerState.leitnerBoxes.box3.length;
    updateMasteredWords(wordsMasteredCount);
  }
  savePlayerState();
}

function demoteLeitnerCard(card) {
  const oldBox = card.sourceBox;
  playerState.leitnerBoxes[oldBox] = playerState.leitnerBoxes[oldBox].filter(c => c.id !== card.id);
  
  // Always moves to Box 1 on failure
  card.box = 1;
  card.nextReviewTimestamp = Date.now() + 12 * 60 * 60 * 1000; // 12 hours
  playerState.leitnerBoxes.box1.push(card);
  savePlayerState();
}

// Phase 1: Input (Reading Icelandic dialogue)
async function fetchNewDialogue() {
  activeContainer.innerHTML = `
    <div class="loader-box">
      <div class="spinner-grim"></div>
      <span>Extracting Comprehensible Input Dialogue...</span>
    </div>
  `;
  
  if (isOfflineMode()) {
    // Fetch offline dialogue
    const idx = Math.floor(Math.random() * FALLBACK_DIALOGUES.length);
    sessionCurrentDialogue = JSON.parse(JSON.stringify(FALLBACK_DIALOGUES[idx]));
    renderDialogueView();
    return;
  }
  
  const prompt = `Generate an Icelandic mini-dialogue or short paragraph (3–5 sentences) for a beginner-intermediate learner. It should tell a tiny story or scene — mundane, funny, or slightly dramatic. Embed exactly 3 target words that a beginner might not know. Return ONLY valid JSON, no markdown: { text_icelandic: string, text_german: string, target_words: [{ icelandic: string, german: string, phonetic: string, grammar_note: string, case_explanation: string }], difficulty: 'beginner'|'intermediate'|'advanced' }. Grammar notes should briefly explain declension case or verb conjugation where relevant — Icelandic has 4 cases (nominative, accusative, dative, genitive), mention which case is used and why in 1 sentence.`;
  
  try {
    const data = await callGeminiApi(prompt);
    if (data.text_icelandic && data.text_german && Array.isArray(data.target_words) && data.target_words.length === 3) {
      sessionCurrentDialogue = data;
      renderDialogueView();
    } else {
      throw new Error("Invalid dialogue structure returned by Gemini API");
    }
  } catch (e) {
    console.warn("Dialogue fetch failed, loading offline fallback:", e);
    const idx = Math.floor(Math.random() * FALLBACK_DIALOGUES.length);
    sessionCurrentDialogue = JSON.parse(JSON.stringify(FALLBACK_DIALOGUES[idx]));
    renderDialogueView();
  }
}

function renderDialogueView() {
  phase = "phase1";
  statsSessionRead++;
  
  // Highlight target words in the Icelandic text
  let highlightedIcelandic = sessionCurrentDialogue.text_icelandic;
  sessionCurrentDialogue.target_words.forEach((tw, idx) => {
    // Escape regex characters just in case, match whole word or partial root
    const escWord = tw.icelandic.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b(${escWord})\\b`, 'gi');
    highlightedIcelandic = highlightedIcelandic.replace(regex, `<span class="target-highlight" data-word-idx="${idx}">$1</span>`);
  });
  
  activeContainer.innerHTML = `
    <div class="lang-container">
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <span class="leitner-status-badge">✦ Mini-Dialogue ${sessionCompletedDialoguesCount + 1} / 2 ✦</span>
        <span class="ui-label" style="color: var(--text-muted);">Phase 1: Input & Inference</span>
      </div>

      <div class="dialogue-split-view">
        <!-- Icelandic source bubble -->
        <div class="parchment-scroll dialogue-bubble" style="background-color: var(--surface-inner); color: var(--text-cream); border-color: var(--border-gold-dim);">
          ${highlightedIcelandic}
        </div>
        
        <!-- German translation bubble (Revealed later) -->
        <div class="parchment-scroll dialogue-bubble" id="german-reveal-bubble" style="opacity: 0.15; transition: opacity 0.4s ease;">
          <div style="filter: blur(4px); transition: filter 0.4s ease;" id="german-blur-mask">
            ${sessionCurrentDialogue.text_german}
          </div>
          <div id="reveal-overlay-btn" style="position: absolute; top:0; left:0; width:100%; height:100%; display:flex; justify-content:center; align-items:center; cursor:pointer;">
            <button class="btn-stone">Reveal German Translation</button>
          </div>
        </div>
      </div>

      <!-- Click Word Info Area -->
      <div id="vocab-quick-info" style="display: none; background-color: var(--surface-inner); border: 1px solid var(--border-gold-dim); padding: 1rem; margin-top: 1rem; animation: slideDown 0.2s ease;"></div>

      <!-- Reveal timer bar -->
      <div class="reveal-timer-container">
        <span style="font-size: 0.9rem; color: var(--text-muted);" id="timer-text">Try reading and inferring meaning for 30s...</span>
        <span style="font-family: 'Cinzel'; color: var(--accent-gold);" id="timer-count">30s</span>
      </div>

      <!-- Vocab definitions block (Hidden until reveal) -->
      <div class="vocabulary-legend" id="vocab-legend-area" style="display: none; animation: slideDown 0.3s ease;">
        <h4 style="font-family: 'Cinzel'; margin: 0 0 0.5rem 0;">Target Vocabulary Mine</h4>
        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          ${sessionCurrentDialogue.target_words.map((tw, idx) => `
            <div class="word-card-inline">
              <strong style="color: var(--text-cream); font-size: 1.1rem;">${tw.icelandic}</strong> 
              <span style="color: var(--text-muted); font-size: 0.85rem;">[${tw.phonetic}]</span> — 
              <span style="color: var(--accent-gold); font-weight: bold;">${tw.german}</span>
              <p style="margin: 0.25rem 0 0 0; font-size: 0.95rem; color: var(--text-muted);">
                <strong>Declension:</strong> ${tw.grammar_note}
              </p>
              <p style="margin: 0.1rem 0 0 0; font-size: 0.9rem; color: var(--text-muted); font-style: italic;">
                <strong>Case Rationale:</strong> ${tw.case_explanation}
              </p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Action Choice Row -->
      <div style="display: flex; justify-content: flex-end; gap: 1rem;" id="dialogue-actions-row">
        <button class="btn-stone" id="btn-force-reveal">Reveal Translation Now</button>
      </div>
    </div>
  `;
  
  // Timer setup
  timerSeconds = 30;
  const countEl = document.getElementById("timer-count");
  const textEl = document.getElementById("timer-text");
  
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timerSeconds--;
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      countEl.textContent = "Ready";
      textEl.textContent = "Translation unlock available.";
      // Automatically glow the reveal button if they haven't clicked it
    } else {
      countEl.textContent = `${timerSeconds}s`;
    }
  }, 1000);

  // Bind reveal events
  const forceRevealBtn = document.getElementById("btn-force-reveal");
  const revealOverlay = document.getElementById("reveal-overlay-btn");
  
  forceRevealBtn.addEventListener("click", revealGermanTranslation);
  revealOverlay.addEventListener("click", revealGermanTranslation);
  
  // Target word highlights click reveals inline grimoire tip
  activeContainer.querySelectorAll(".target-highlight").forEach(el => {
    el.addEventListener("click", (e) => {
      const idx = parseInt(e.currentTarget.getAttribute("data-word-idx"));
      const tw = sessionCurrentDialogue.target_words[idx];
      if (tw) {
        const infoBox = document.getElementById("vocab-quick-info");
        if (infoBox) {
          infoBox.style.display = "block";
          infoBox.innerHTML = `
            <h5 style="margin:0 0 0.4rem 0; font-family:'Cinzel'; color:var(--accent-gold); font-size:1rem;">Rune of Translation: ${tw.icelandic}</h5>
            <p style="margin:0; font-size:1.1rem; color:var(--text-cream);">
              Pronunciation: <span style="color:var(--text-muted);">[${tw.phonetic}]</span> — 
              Meaning: <strong style="color:var(--accent-gold);">${tw.german}</strong>
            </p>
            <p style="margin:0.25rem 0 0 0; font-size:0.95rem; color:var(--text-muted);">
              <strong>Declension/Conjugation:</strong> ${tw.grammar_note}
            </p>
            <p style="margin:0.1rem 0 0 0; font-size:0.95rem; color:var(--text-muted); font-style:italic;">
              <strong>Case Use:</strong> ${tw.case_explanation}
            </p>
          `;
        }
      }
    });
  });
}

function revealGermanTranslation() {
  clearInterval(timerInterval);
  
  const bubble = document.getElementById("german-reveal-bubble");
  const mask = document.getElementById("german-blur-mask");
  const overlay = document.getElementById("reveal-overlay-btn");
  const timerBar = document.querySelector(".reveal-timer-container");
  const forceRevealBtn = document.getElementById("btn-force-reveal");
  const vocabArea = document.getElementById("vocab-legend-area");
  const actionsRow = document.getElementById("dialogue-actions-row");
  
  if (bubble) bubble.style.opacity = 1;
  if (mask) mask.style.filter = "none";
  if (overlay) overlay.remove();
  if (timerBar) timerBar.remove();
  if (forceRevealBtn) forceRevealBtn.remove();
  if (vocabArea) vocabArea.style.display = "block";
  
  // Save sentence cards in Leitner Box 1
  saveDialogueWordsAsSentenceCards();
  
  // Change actions row to go to Output Phase
  if (actionsRow) {
    actionsRow.innerHTML = `
      <button class="btn-stone" id="btn-go-output">Proceed to Output Hypothesis ✦</button>
    `;
    document.getElementById("btn-go-output").addEventListener("click", renderOutputPhase);
  }
}

// Convert Target Words to Sentence Cards
function saveDialogueWordsAsSentenceCards() {
  const txt = sessionCurrentDialogue.text_icelandic;
  
  // Split into sentences
  const sentences = txt.split(/(?<=[.!?])\s+/);
  
  sessionCurrentDialogue.target_words.forEach(tw => {
    // Find the sentence containing this target word
    const matchingSentence = sentences.find(s => {
      const reg = new RegExp(`\\b${tw.icelandic}\\b`, 'i');
      return reg.test(s);
    }) || sentences[0]; // fallback
    
    // Create sentence card
    const cardId = `card_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const escWord = tw.icelandic.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const blankRegex = new RegExp(`\\b(${escWord})\\b`, 'i');
    
    const sentenceWithBlank = matchingSentence.replace(blankRegex, "_________________");
    
    const newCard = {
      id: cardId,
      sentence: matchingSentence,
      blankedWord: tw.icelandic,
      sentenceWithBlank: sentenceWithBlank,
      translation: tw.german,
      hints: {
        grammar_note: tw.grammar_note,
        case_explanation: tw.case_explanation
      },
      box: 1,
      nextReviewTimestamp: Date.now() + 12 * 60 * 60 * 1000 // due in 12 hours
    };
    
    // Add to Box 1
    playerState.leitnerBoxes.box1.push(newCard);
  });
  
  savePlayerState();
}

// Phase 3: Output (Writing an original sentence)
function renderOutputPhase() {
  phase = "phase3";
  // Choose one target word at random for the user to try using
  const chosenWordObj = sessionCurrentDialogue.target_words[Math.floor(Math.random() * 3)];
  
  activeContainer.innerHTML = `
    <div class="lang-container">
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <span class="leitner-status-badge">✦ Output Phase ✦</span>
        <span class="ui-label" style="color: var(--text-muted);">Phase 3: Active Production</span>
      </div>
      
      <h3 style="font-family: 'Cinzel'; margin-bottom: 0.5rem;">Synthesize Your Sentence</h3>
      <p style="color: var(--text-cream); font-size: 1.15rem; margin-bottom: 1.5rem;">
        Write one original sentence in Icelandic using the target word: 
        <strong style="color: var(--accent-gold); font-size: 1.35rem; font-family: 'Cinzel'; font-weight: bold; margin-left: 0.5rem;">
          ${chosenWordObj.icelandic}
        </strong> 
        <span style="font-size: 0.95rem; color: var(--text-muted); font-family: 'Inter'; font-weight: normal; margin-left: 0.4rem;">
          (${chosenWordObj.german})
        </span>
      </p>

      <div class="input-group">
        <label for="output-sentence-input" class="ui-label">Your Icelandic Sentence:</label>
        <textarea id="output-sentence-input" class="input-grimoire" rows="3" placeholder="Skrifaðu setningu hér..."></textarea>
        ${createCharBarHtml("output-sentence-input")}
      </div>

      <div id="output-feedback-area" style="display: none; margin-bottom: 1.5rem;"></div>

      <div style="display: flex; justify-content: flex-end; gap: 1rem;" id="output-actions-row">
        <button class="btn-stone" id="btn-submit-output">Submit and Correct ✦</button>
      </div>
    </div>
  `;
  
  const submitBtn = document.getElementById("btn-submit-output");
  const sentenceTextarea = document.getElementById("output-sentence-input");
  
  bindCharBarEvents(activeContainer);
  
  submitBtn.addEventListener("click", async () => {
    const userSentence = sentenceTextarea.value.trim();
    if (!userSentence) {
      alert("Please enter a sentence.");
      return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = "Correcting...";
    
    try {
      const correction = await verifyOutputSentence(userSentence, chosenWordObj.icelandic);
      statsSessionWritten++;
      
      let bonusXp = 0;
      if (correction.is_correct) {
        bonusXp = 40;
        addXp(40); // 40 bonus XP
      } else {
        sessionHadMistakes = true;
      }
      
      // Complete Dialogue XP
      addXp(25); // 25 XP for dialogue completion
      
      renderOutputFeedback(userSentence, chosenWordObj.icelandic, correction, bonusXp);
    } catch (e) {
      console.error(e);
      // Fallback completion without correction if offline
      addXp(25); // completed session
      renderOutputFeedback(userSentence, chosenWordObj.icelandic, {
        is_correct: true,
        corrected_sentence: userSentence,
        explanation_german: "Offline Mode: Grammatikalische Überprüfung übersprungen. Du hast 25 Standard-XP erhalten!"
      }, 0);
    }
  });
}

async function verifyOutputSentence(sentence, targetWord) {
  if (isOfflineMode()) {
    const normSentence = normalizeIcelandic(sentence);
    const normTarget = normalizeIcelandic(targetWord);
    
    // Check if the user sentence is at least 3 words and contains the target word
    const words = sentence.split(/\s+/).filter(w => w.length > 0);
    const hasTargetWord = normSentence.includes(normTarget);
    
    if (words.length >= 3 && hasTargetWord) {
      return {
        is_correct: true,
        corrected_sentence: sentence,
        explanation_german: `Offline-Modus aktiv. Dein Satz enthält das Wort '${targetWord}' und erfüllt die Längenbedingungen (+40 XP Bonus gewährt).`
      };
    } else {
      let errorMsg = "Dein Satz ist zu kurz. Bitte schreibe mindestens 3 Wörter.";
      if (!hasTargetWord) {
        errorMsg = `Dein Satz enthält das geforderte Wort '${targetWord}' nicht. Bitte verwende es (Akzente/Umlaute sind optional).`;
      }
      return {
        is_correct: false,
        corrected_sentence: sentence,
        explanation_german: `${errorMsg} (Offline-Überprüfung)`
      };
    }
  }
  
  const prompt = `The user is learning Icelandic and wrote this sentence: '${sentence}'. They were trying to use the word '${targetWord}'. Respond ONLY in valid JSON: { is_correct: boolean, corrected_sentence: string, explanation_german: string (max 2 sentences, friendly tone, explain what was wrong or confirm what was right) }.`;
  
  return await callGeminiApi(prompt);
}

function renderOutputFeedback(sentence, targetWord, correction, bonusXp) {
  const feedbackArea = document.getElementById("output-feedback-area");
  const actionsRow = document.getElementById("output-actions-row");
  const textarea = document.getElementById("output-sentence-input");
  
  textarea.disabled = true;
  feedbackArea.style.display = "block";
  
  // Render word comparison diff visually
  let diffHtml = "";
  if (correction.is_correct) {
    diffHtml = `<span class="diff-correct">${correction.corrected_sentence}</span>`;
  } else {
    diffHtml = `
      <div style="margin-bottom: 0.5rem;">
        <span class="ui-label" style="font-size: 0.65rem; color: var(--accent-red);">Your Sentence:</span>
        <p style="color: #ff5555; text-decoration: line-through;">${sentence}</p>
      </div>
      <div>
        <span class="ui-label" style="font-size: 0.65rem; color: var(--accent-gold);">Corrected Sentence:</span>
        <p class="diff-correct">${correction.corrected_sentence}</p>
      </div>
    `;
  }
  
  feedbackArea.innerHTML = `
    <div class="explanation-box" style="margin-top: 0; border-color: ${correction.is_correct ? '#4c914c' : 'var(--accent-gold)'};">
      <h4 style="font-family: 'Cinzel'; color: ${correction.is_correct ? '#4c914c' : 'var(--accent-gold)'}; margin-bottom: 0.75rem;">
        ${correction.is_correct ? `✦ SYNTAX CORRECT (+40 XP Bonus) ✦` : "✦ CORRECTION RENDERED ✦"}
      </h4>
      <div class="diff-container" style="margin-bottom: 1rem;">
        ${diffHtml}
      </div>
      <p style="font-family: 'EB Garamond'; font-size: 1.1rem; color: var(--text-cream); margin: 0;">
        ${correction.explanation_german}
      </p>
    </div>
  `;
  
  sessionCompletedDialoguesCount++;
  
  if (sessionCompletedDialoguesCount >= 2) {
    // Dispatch session completion for quests
    window.dispatchEvent(new CustomEvent("icelandic-session-completed", {
      detail: { isPerfect: !sessionHadMistakes }
    }));
    actionsRow.innerHTML = `
      <button class="btn-stone" id="btn-complete-session">Finalize Training Session ✦</button>
    `;
    document.getElementById("btn-complete-session").addEventListener("click", renderSessionSummary);
  } else {
    actionsRow.innerHTML = `
      <button class="btn-stone" id="btn-next-dialogue">Next Dialogue ✦</button>
    `;
    document.getElementById("btn-next-dialogue").addEventListener("click", fetchNewDialogue);
  }
}

// Session Summary View
function renderSessionSummary() {
  phase = "session_complete";
  
  activeContainer.innerHTML = `
    <div class="lang-container" style="text-align: center; padding: 2rem;">
      <h2 style="font-family: 'Cinzel'; color: var(--accent-gold); margin-bottom: 1rem;">RUNES OF COMPREHENSION UNFOLDED</h2>
      <p style="font-family: 'EB Garamond'; font-size: 1.25rem; color: var(--text-cream); margin-bottom: 2rem;">
        You have successfully digested 2 mini-dialogues and synthesized active output sentences.
      </p>
      
      <div class="leitner-stats-row" style="max-width: 500px; margin: 0 auto 2.5rem auto;">
        <div class="leitner-box-widget">
          <span class="count">${statsSessionRead}</span>
          <span class="ui-label" style="font-size: 0.65rem;">Dialogues Read</span>
        </div>
        <div class="leitner-box-widget">
          <span class="count">${statsSessionWritten}</span>
          <span class="ui-label" style="font-size: 0.65rem;">Sentences Written</span>
        </div>
        <div class="leitner-box-widget">
          <span class="count">${playerState.leitnerBoxes.box1.length + playerState.leitnerBoxes.box2.length}</span>
          <span class="ui-label" style="font-size: 0.65rem;">Active Cards</span>
        </div>
      </div>
      
      <button class="btn-stone" id="btn-finish-lang-session">Seal Training Session</button>
    </div>
  `;
  
  document.getElementById("btn-finish-lang-session").addEventListener("click", () => {
    // Reset session trackers and reload start screen
    statsSessionRead = 0;
    statsSessionWritten = 0;
    
    // Refresh to view if due cards remain, otherwise start screen
    startSessionRouter();
  });
}
