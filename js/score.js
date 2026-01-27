/***********************
 * SCORE MANAGEMENT
 * 
 * Handles score strip rendering and score adjustments
 ***********************/

// Render all score strips
function renderScoreStrips() {
  renderScoreStrip(document.getElementById("scoreStripStart"), { mode: "board" });
  renderScoreStrip(document.getElementById("scoreStripBoard"), { mode: "board" });
  renderScoreStrip(document.getElementById("scoreStripClue"), { mode: "clue" });
  renderScoreStrip(document.getElementById("scoreStripDD"), { mode: "board" });
}

// Render a single score strip
function renderScoreStrip(container, { mode }) {
  container.innerHTML = "";
  container.style.gridTemplateColumns = `repeat(${state.teams.length}, 1fr)`;

  state.teams.forEach((t, idx) => {
    const podium = document.createElement("div");
    podium.className = "podium";

    // === SCORE ROW ===
    const scoreRow = document.createElement("div");
    scoreRow.className = "score-row" + (mode === "board" ? " board-mode" : "");

    const scoreValue = document.createElement("div");
    scoreValue.className = "score-value" + ((t.score || 0) < 0 ? " negative" : "");
    
    // Set currency as data attribute for CSS ::before
    scoreValue.setAttribute("data-currency", GAME.currency);
    
    // Display only the numeric value
    const score = Number(t.score ?? 0);
    const abs = Math.abs(score);
    scoreValue.textContent = (score < 0 ? `-${abs}` : `${abs}`);
    
    scoreValue.addEventListener("click", (e) => {
      e.stopPropagation();
      openScoresModal();
    });

    if (mode === "clue") {
      // Add +/- buttons for clue mode
      const minus = document.createElement("div");
      minus.className = "score-btn minus";
      minus.textContent = "−";
      
      // Get current adjustment state for this team
      const adjustment = currentClueAdjustments[idx] || 0;
      
      // Disable minus button if already at -1
      if (adjustment <= -1) {
        minus.classList.add("disabled");
      }
      
      minus.addEventListener("click", (e) => {
        e.stopPropagation();
        adjustScore(idx, -(currentValue || 0));
      });

      const plus = document.createElement("div");
      plus.className = "score-btn plus";
      plus.textContent = "+";
      
      // Disable plus button if already at +1
      if (adjustment >= 1) {
        plus.classList.add("disabled");
      }
      
      plus.addEventListener("click", (e) => {
        e.stopPropagation();
        adjustScore(idx, +(currentValue || 0));
      });

      scoreRow.appendChild(minus);
      scoreRow.appendChild(scoreValue);
      scoreRow.appendChild(plus);
    } else {
      scoreRow.appendChild(scoreValue);
    }

    // === SIGNATURE BOX ===
    const sigBox = document.createElement("div");
    sigBox.className = "sig-box";
    sigBox.addEventListener("click", (e) => {
      e.stopPropagation();
      openTeamModal(idx);
    });

    if (t.sig) {
      const img = document.createElement("img");
      img.className = "sig-img";
      img.src = t.sig;
      img.draggable = false;
      sigBox.appendChild(img);
    } else {
      const ph = document.createElement("div");
      ph.className = "sig-placeholder";
      ph.textContent = "SIGNATURE";
      sigBox.appendChild(ph);
    }

    const name = document.createElement("div");
    name.className = "team-name";
    name.textContent = (t.name || `TEAM ${idx + 1}`).toUpperCase();
    sigBox.appendChild(name);

    podium.appendChild(scoreRow);
    podium.appendChild(sigBox);

    container.appendChild(podium);
  });
}

// Adjust team score by delta
function adjustScore(teamIdx, delta) {
  if (!delta) return;
  
  // Get current adjustment state for this team (default 0)
  const currentAdjustment = currentClueAdjustments[teamIdx] || 0;
  
  // Calculate new adjustment state
  const newAdjustment = currentAdjustment + (delta > 0 ? 1 : -1);
  
  // Enforce limits: -1, 0, or +1 only
  if (newAdjustment < -1 || newAdjustment > 1) {
    return; // Can't adjust further in this direction
  }
  
  // Apply score change
  state.teams[teamIdx].score = (state.teams[teamIdx].score || 0) + delta;
  
  // Update adjustment tracking
  currentClueAdjustments[teamIdx] = newAdjustment;
  
  saveState();
  renderScoreStrips();
}
