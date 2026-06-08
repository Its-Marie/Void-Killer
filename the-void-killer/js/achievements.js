// The Void Killer - Achievements Module

import { playerState, ACHIEVEMENTS_DB } from './gamification.js';

// Custom CSS for achievements view
function injectAchievementStyles() {
  const styleId = "achievements-ui-styles";
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .achievements-layout {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 700px;
      margin: 0 auto;
    }
    
    .achievements-summary-header {
      background-color: var(--surface-inner);
      border: 1px solid var(--border-gold-dim);
      padding: 1.25rem 2rem;
      text-align: center;
      display: flex;
      justify-content: space-around;
      align-items: center;
    }
    
    .ach-score {
      font-size: 2.2rem;
      font-family: 'Cinzel', serif;
      color: var(--accent-gold);
      font-weight: bold;
    }
    
    .ach-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .ach-card {
      background-color: var(--surface-inner);
      border: 1px solid var(--border-gold-dim);
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      transition: all 0.3s ease;
      position: relative;
    }
    
    .ach-card.unlocked {
      border: double 4px var(--accent-gold);
      background-color: rgba(201, 168, 76, 0.04);
      box-shadow: 0 0 10px var(--accent-gold-glow);
    }
    
    .ach-card.locked {
      opacity: 0.65;
      filter: grayscale(0.5);
    }
    
    .ach-icon-frame {
      width: 48px;
      height: 48px;
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .ach-icon-svg {
      width: 100%;
      height: 100%;
      fill: none;
      stroke-width: 2;
    }
    
    .ach-card.unlocked .ach-icon-svg {
      stroke: var(--accent-gold);
      filter: drop-shadow(0 0 4px var(--accent-gold-glow));
    }
    
    .ach-card.locked .ach-icon-svg {
      stroke: var(--border-gold-dim);
    }
    
    .ach-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex-grow: 1;
    }
    
    .ach-title-text {
      font-family: 'Cinzel', serif;
      font-size: 1.15rem;
      color: var(--text-cream);
      font-weight: 600;
    }
    
    .ach-card.unlocked .ach-title-text {
      color: var(--accent-gold);
    }
    
    .ach-desc-text {
      font-family: 'EB Garamond', serif;
      font-size: 1.05rem;
      color: var(--text-muted);
    }
    
    .ach-card.unlocked .ach-desc-text {
      color: var(--text-cream);
    }
    
    .ach-status-label {
      font-size: 0.7rem;
      font-family: 'Inter', sans-serif;
      text-transform: uppercase;
      padding: 0.15rem 0.4rem;
      border-radius: 1px;
      font-weight: bold;
    }
    
    .ach-card.unlocked .ach-status-label {
      background-color: var(--accent-gold);
      color: #000;
    }
    
    .ach-card.locked .ach-status-label {
      background-color: #2b251e;
      color: var(--text-muted);
      border: 1px solid var(--border-gold-dim);
    }
  `;
  document.head.appendChild(style);
}

export function initAchievementsView(container) {
  injectAchievementStyles();
  
  const totalAchievements = Object.keys(ACHIEVEMENTS_DB).length;
  const unlockedCount = playerState.achievements.length;
  const pct = Math.round((unlockedCount / totalAchievements) * 100);
  
  container.innerHTML = `
    <div class="achievements-layout">
      
      <!-- Summary Header -->
      <div class="achievements-summary-header">
        <div>
          <span class="ach-score">${unlockedCount} / ${totalAchievements}</span>
          <span class="ui-label" style="display: block; font-size: 0.65rem; color: var(--text-muted); margin-top: 0.25rem;">Feats Unlocked</span>
        </div>
        
        <div style="flex-grow: 0.5; max-width: 200px;">
          <div class="xp-label-row">
            <span class="ui-label" style="font-size: 0.65rem; color: var(--text-muted);">Feats Complete</span>
            <span style="font-family: 'Inter'; font-size: 0.75rem; color: var(--accent-gold);">${pct}%</span>
          </div>
          <div class="xp-bar-outer" style="height: 6px; margin-top: 0.25rem;">
            <div class="xp-bar-inner" style="width: ${pct}%; background-color: var(--accent-gold);"></div>
          </div>
        </div>
      </div>

      <!-- Achievement List -->
      <div class="ach-list">
        ${Object.values(ACHIEVEMENTS_DB).map(ach => {
          const isUnlocked = playerState.achievements.includes(ach.id);
          return `
            <div class="ach-card ${isUnlocked ? 'unlocked' : 'locked'}">
              <div class="ach-icon-frame">
                <!-- Achievement Seal SVG -->
                <svg class="ach-icon-svg" viewBox="0 0 24 24">
                  ${isUnlocked ? `
                    <!-- Unlocked Sunburst Seal -->
                    <circle cx="12" cy="12" r="8" />
                    <path d="M12,2 L12,4 M12,20 L12,22 M2,12 L4,12 M20,12 L22,12 M5,5 L7,7 M17,17 L19,19 M5,19 L7,17 M17,5 L19,7" />
                    <polyline points="9 11 11 13 15 9" stroke-linecap="round" stroke-linejoin="round" />
                  ` : `
                    <!-- Locked Closed padlock Seal -->
                    <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  `}
                </svg>
              </div>
              <div class="ach-details">
                <span class="ach-title-text">${ach.title}</span>
                <span class="ach-desc-text">${ach.desc}</span>
              </div>
              <div>
                <span class="ach-status-label">${isUnlocked ? "UNLOCKED" : "LOCKED"}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
