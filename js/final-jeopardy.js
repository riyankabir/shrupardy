/***********************
 * FINAL JEOPARDY
 * 
 * Handles complete Final Jeopardy flow:
 * 1. Detection & trigger button
 * 2. Title screen
 * 3. Category screen
 * 4. Question screen
 * 5. Wager screens (per team)
 * 6. Winner reveal
 * 7. Winner podium
 * 8. Scoreboard modal
 ***********************/

// Final Jeopardy state
let fjState = {
  started: false,
  wagers: {},        // { teamIdx: wagerAmount }
  teamOrder: [],     // Sorted team indices (lowest to highest score)
  currentTeamIdx: 0, // Current index in teamOrder array
  winnerIdx: null,
  tiedTeams: [] 
};

// ===========================
// DETECTION & TRIGGER
// ===========================

// Check if all 30 tiles are used
function checkForFinalJeopardy() {
  const totalTiles = GAME.categories.length * GAME.values.length;
  const usedTiles = Object.keys(state.used).length;
  
  if (usedTiles === totalTiles && !fjState.started) {
    showFJTrigger();
  }
}

// Show "Are you ready for..." button
function showFJTrigger() {
  const overlay = document.getElementById("fjTrigger");
  overlay.classList.add("show");
  
  document.getElementById("fjTriggerBtn").addEventListener("click", () => {
    const btn = document.getElementById("fjTriggerBtn");
    btn.style.opacity = "0";
    
    setTimeout(() => {
      overlay.classList.remove("show");
      fjState.started = true;
      showFJTitle();
    }, GAME.finalJeopardy.timings.buttonFade);
  });
}

// ===========================
// TITLE SCREEN
// ===========================

function showFJTitle() {
  const overlay = document.getElementById("fjTitle");
  overlay.classList.add("show");
  
  // Hide game screen
  document.getElementById("gameScreen").classList.remove("show");
  
  // Initialize stars for FJ title screen
  setTimeout(() => {
    initTitleStars("fjTitleStars");
  }, 100);
  
  document.getElementById("fjRevealBtn1").addEventListener("click", () => {
    overlay.classList.remove("show");
    showFJCategory();
  });
}

// ===========================
// CATEGORY SCREEN
// ===========================

function showFJCategory() {
  const overlay = document.getElementById("fjCategory");
  overlay.classList.add("show");
  
  const categoryText = document.getElementById("fjCategoryText");
  categoryText.textContent = GAME.finalJeopardy.category;
  
  document.getElementById("fjCategoryArrow").addEventListener("click", () => {
    overlay.classList.remove("show");
    showFJQuestion();
  });
}

// ===========================
// QUESTION SCREEN
// ===========================

function showFJQuestion() {
  const overlay = document.getElementById("fjQuestion");
  overlay.classList.add("show");
  
  const questionText = document.getElementById("fjQuestionText");
  questionText.textContent = GAME.finalJeopardy.question;

  // Resize AFTER text renders
  requestAnimationFrame(() => autoFitText(questionText, 80, 24));
  
  document.getElementById("fjQuestionArrow").addEventListener("click", () => {
    overlay.classList.remove("show");
    startFJWagers();
  });
}

function autoFitText(el, maxFont = 72, minFont = 20) {
  if (!el) return;

  // Start large
  el.style.fontSize = maxFont + "px";

  // Fit INSIDE the element's own box (your 80vw/75vh safe rectangle)
  while (
    (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) &&
    parseInt(el.style.fontSize, 10) > minFont
  ) {
    el.style.fontSize = (parseInt(el.style.fontSize, 10) - 2) + "px";
  }
}

function refitVisibleFJText() {
  const question = document.getElementById("fjQuestionText");

  if (question && question.offsetParent !== null) {
    autoFitText(question, 80, 24);
  }
}

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(refitVisibleFJText, 100);
});

// ===========================
// WAGER SCREENS
// ===========================

function startFJWagers() {
  // Sort teams by score (lowest to highest) ONCE
  fjState.teamOrder = state.teams
    .map((team, idx) => ({ idx, score: team.score || 0 }))
    .sort((a, b) => a.score - b.score)
    .map(item => item.idx);
  
  fjState.currentTeamIdx = 0;
  showFJWagerScreen();
}

function showFJWagerScreen() {
  const teamIdx = fjState.teamOrder[fjState.currentTeamIdx];
  const team = state.teams[teamIdx];
  const overlay = document.getElementById("fjWager");

  
  // NOW setup all child elements
  const wagerInput = document.getElementById("fjWagerInput");
  const lockBtn = document.getElementById("fjLockBtn");
  
  wagerInput.value = ""; // Clear to show placeholder
  wagerInput.disabled = false;
  lockBtn.innerHTML = `<img src="assets/lock.svg" alt="Lock" />`;
  lockBtn.classList.remove("arrow-mode");
  
  // Render team podium (signature + name)
  renderFJTeamPodium(team, teamIdx);
  
    // Update team name overlay
  const teamNameEl = document.getElementById("fjTeamName");
  teamNameEl.textContent = (team.name || `TEAM ${teamIdx + 1}`).toUpperCase();
  
  // Show score in bottom tile
  const scoreDisplay = document.getElementById("fjScoreDisplay");
  const score = team.score || 0;
  const abs = Math.abs(score);
  scoreDisplay.textContent = `$${score < 0 ? `-${abs}` : abs}`;
  scoreDisplay.className = "fj-score-display" + (score < 0 ? " negative" : "");
  scoreDisplay.style.display = "block";
  
  // Reset and hide answer buttons for new team
  const answerButtons = document.getElementById("fjAnswerButtons");
  const incorrectBtn = document.getElementById("fjIncorrectBtn");
  const correctBtn = document.getElementById("fjCorrectBtn");
  // Force blur to clear any hover states
  incorrectBtn.blur();
  correctBtn.blur();
  
  // Remove all classes and inline styles
  incorrectBtn.classList.remove("selected");
  correctBtn.classList.remove("selected");
  incorrectBtn.removeAttribute("style");
  correctBtn.removeAttribute("style");
  
  // Hide the container
  answerButtons.style.display = "none";
  
  overlay.classList.add("show");

  // Lock button handler
  lockBtn.onclick = null; // Remove previous handler
  lockBtn.onclick = () => {
    if (!lockBtn.classList.contains("arrow-mode")) {
      // LOCK MODE: Save wager and show answer buttons
      const wager = parseInt(wagerInput.value, 10) || 0;
      fjState.wagers[teamIdx] = wager;
      
      wagerInput.disabled = true;
      currentValue = wager; // Set wager as current value for scoring
      
      // Hide score display, show answer buttons
      scoreDisplay.style.display = "none";
      showFJAnswerButtons(teamIdx);
      
    } else {
      // ARROW MODE: Go to next team
      // Hide and reset answer buttons BEFORE transitioning overlay
      const answerButtons = document.getElementById("fjAnswerButtons");
      const incorrectBtn = document.getElementById("fjIncorrectBtn");
      const correctBtn = document.getElementById("fjCorrectBtn");
      
   
      incorrectBtn.classList.remove("selected");
      correctBtn.classList.remove("selected");
      incorrectBtn.blur();
      correctBtn.blur();

      answerButtons.style.display = "none";
      
      // Now transition overlay
      overlay.classList.remove("show");
      fjState.currentTeamIdx++;
      
      if (fjState.currentTeamIdx < fjState.teamOrder.length) {
        showFJWagerScreen();
      } else {
        // ALL TEAMS DONE - Check for ties before showing winner reveal
        const maxScore = Math.max(...state.teams.map(t => t.score || 0));
        const tiedTeams = state.teams
          .map((team, idx) => ({ idx, score: team.score || 0 }))
          .filter(team => team.score === maxScore);
        
        if (tiedTeams.length > 1) {
          // There's a tie - show intro first
          fjState.tiedTeams = tiedTeams.map(t => t.idx);
          showFJTieBreakerIntro();  // Show intro button first
        } else {
          // No tie - proceed to winner reveal
          showFJWinnerReveal();
        }
      }
    }
  };
}

function renderFJTeamPodium(team, teamIdx) {
  const podiumEl = document.getElementById("fjTeamPodium");
  
  // Just render signature, name goes in overlay
  if (team.sig) {
    podiumEl.innerHTML = `<img src="${team.sig}" class="sig-img" alt="Signature" />`;
  } else {
    podiumEl.innerHTML = '<div class="sig-placeholder">SIGNATURE</div>';
  }
}

function showFJAnswerButtons(teamIdx) {
  const answerButtons = document.getElementById("fjAnswerButtons");
  const incorrectBtn = document.getElementById("fjIncorrectBtn");
  const correctBtn = document.getElementById("fjCorrectBtn");
  const lockBtn = document.getElementById("fjLockBtn");
  
  answerButtons.style.display = "grid";
  
  // Incorrect button handler
  incorrectBtn.onclick = (e) => {
    e.stopPropagation();
    incorrectBtn.classList.add("selected");
    correctBtn.classList.remove("selected");
    
    // Subtract wager from score
    state.teams[teamIdx].score = (state.teams[teamIdx].score || 0) - currentValue;
    saveState();
    
    // Enable arrow mode
    enableArrow();
  };
  
  // Correct button handler
  correctBtn.onclick = (e) => {
    e.stopPropagation();
    correctBtn.classList.add("selected");
    incorrectBtn.classList.remove("selected");
    
    // Add wager to score
    state.teams[teamIdx].score = (state.teams[teamIdx].score || 0) + currentValue;
    saveState();
    
    // Enable arrow mode
    enableArrow();
  };
  
  function enableArrow() {
    lockBtn.innerHTML = `<span class="arrow-symbol">&rarr;</span>`;
    lockBtn.classList.add("arrow-mode");
  }
}

// ===========================
// TIE BREAKER 
// ===========================

function showFJTieBreakerIntro() {
  const overlay = document.getElementById("fjTieBreakerIntro");
  overlay.classList.add("show");
  
  const btn = document.getElementById("fjTieBreakerIntroBtn");
  btn.addEventListener("click", () => {
    btn.style.opacity = "0";
    
    setTimeout(() => {
      overlay.classList.remove("show");
      showFJTieBreaker();
    }, GAME.finalJeopardy.timings.buttonFade);
  });
}

function showFJTieBreaker() {
  const overlay = document.getElementById("fjTieBreaker");
  overlay.classList.add("show");
  
  // Initialize stars
  setTimeout(() => {
    initTitleStars("fjTieBreakerStars");
  }, 100);
  
  // Render team buttons
  const buttonsContainer = document.getElementById("fjTieBreakerButtons");
  buttonsContainer.innerHTML = "";
  
  let selectedTeamIdx = null;
  
  fjState.tiedTeams.forEach(teamIdx => {
    const team = state.teams[teamIdx];
    const btn = document.createElement("button");
    btn.className = "fj-tiebreaker-btn";
    btn.textContent = (team.name || `TEAM ${teamIdx + 1}`).toUpperCase();
    
    btn.addEventListener("click", () => {
      // Deselect all buttons
      buttonsContainer.querySelectorAll(".fj-tiebreaker-btn").forEach(b => {
        b.classList.remove("selected");
      });
      
      // Select this button
      btn.classList.add("selected");
      selectedTeamIdx = teamIdx;
    });
    
    buttonsContainer.appendChild(btn);
  });
  
  // Reveal button handler
  const revealBtn = document.getElementById("fjTieBreakerReveal");
  revealBtn.onclick = () => {
    if (selectedTeamIdx === null) {
      alert("Please select a team first!");
      return;
    }
    
    // Double the winner's score
    state.teams[selectedTeamIdx].score = (state.teams[selectedTeamIdx].score || 0) * 2;
    saveState();
    
    // Transition to winner reveal
    overlay.classList.remove("show");
    showFJWinnerReveal();  // Go directly to winner reveal
  };
}

// ===========================
// WINNER REVEAL & PODIUM
// ===========================

function showFJWinnerReveal() {
  const overlay = document.getElementById("fjWinnerReveal");
  overlay.classList.add("show");
  
  const btn = document.getElementById("fjRevealBtn2");
  btn.addEventListener("click", () => {
    btn.style.opacity = "0";
    
    setTimeout(() => {
      overlay.classList.remove("show");
      showFJWinnerPodium();
    }, GAME.finalJeopardy.timings.buttonFade);
  });
}

function showFJWinnerPodium() {
  // Find winner (highest score)
  let maxScore = -Infinity;
  let winnerIdx = 0;
  
  state.teams.forEach((team, idx) => {
    const score = team.score || 0;
    if (score > maxScore) {
      maxScore = score;
      winnerIdx = idx;
    }
  });
  
  fjState.winnerIdx = winnerIdx;
  const winner = state.teams[winnerIdx];
  
  const overlay = document.getElementById("fjWinner");
  overlay.classList.add("show");
  
  // Now access child elements
  const scoreEl = document.getElementById("fjWinnerScore");
  const sigEl = document.getElementById("fjWinnerSig");
  const nameEl = document.getElementById("fjWinnerName");
  const scoreboardBtn = document.getElementById("fjScoreboardBtn");
  
  // Populate winner info
  const score = winner.score || 0;
  const abs = Math.abs(score);
  scoreEl.textContent = `$${score < 0 ? `-${abs}` : abs}`;
  scoreEl.className = score < 0 ? "fj-winner-score negative" : "fj-winner-score";
  
  if (winner.sig) {
    sigEl.innerHTML = `<img src="${winner.sig}" class="sig-img" alt="Signature" />`;
  } else {
    sigEl.innerHTML = '<div class="sig-placeholder">SIGNATURE</div>';
  }
  
  nameEl.textContent = (winner.name || `TEAM ${winnerIdx + 1}`).toUpperCase();
  
  // Reinitialize starfield for winner screen
  setTimeout(() => {
    initTitleStars("fjWinnerStars");
  }, 100);
  
  // Show scoreboard button after delay with fade-in
  scoreboardBtn.style.display = "block";
  scoreboardBtn.style.opacity = "0";
  scoreboardBtn.style.pointerEvents = "none";
  
  setTimeout(() => {
    scoreboardBtn.style.opacity = "1";
    scoreboardBtn.style.pointerEvents = "auto";
    scoreboardBtn.onclick = () => showFJScoreboard();
  }, GAME.finalJeopardy.timings.scoreboardDelay);
}

// ===========================
// SCOREBOARD MODAL
// ===========================

function showFJScoreboard() {
  const modal = document.getElementById("fjScoreboardModal");
  const listEl = document.getElementById("fjScoreboardList");
  
  // Sort teams by score (highest to lowest)
  const sorted = state.teams
    .map((team, idx) => ({ ...team, idx }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));
  
  // Render scoreboard
  listEl.innerHTML = sorted.map((team, rank) => {
    const score = team.score || 0;
    const abs = Math.abs(score);
    return `
      <div class="fj-score-row">
        <div class="fj-rank">${rank + 1}</div>
        <div class="fj-score-name">${(team.name || `TEAM ${team.idx + 1}`).toUpperCase()}</div>
        <div class="fj-score-value ${score < 0 ? 'negative' : ''}">$${score < 0 ? `-${abs}` : abs}</div>
      </div>
    `;
  }).join('');
  
  modal.classList.add("show");
  
  // Close button
  document.getElementById("fjScoreboardClose").onclick = () => {
    modal.classList.remove("show");
  };
}
