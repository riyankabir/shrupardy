/***********************
 * MAIN APPLICATION
 *
 * Initializes the game and coordinates all modules
 ***********************/

// Track if sponsor video should be shown (off by default)
let showSponsorVideo = false;

// Start a new game
function newGame() {
  const teamCountEl = document.getElementById("teamCount");
  const ddCountEl = document.getElementById("ddCount");
  
  const teamCount = parseInt(teamCountEl.value, 10);
  const ddCount = parseInt(ddCountEl.value, 10);

  setTeamsCount(teamCount);

  state.used = {};
  state.ddCount = ddCount;
  randomizeDailyDoubles(ddCount);

  // Reset scores (keep names/signatures)
  state.teams.forEach(t => t.score = 0);

  saveState();
  renderBoard();
  renderScoreStrips();

  // Check if sponsor video should be shown
  if (showSponsorVideo) {
    showSponsorScreen();
  } else {
    show(document.getElementById("gameScreen"));
  }
}

// Show sponsor video screen
function showSponsorScreen() {
  const sponsorVideo = document.getElementById("sponsorVideo");
  show(document.getElementById("sponsorScreen"));

  // Reset and play the video
  sponsorVideo.currentTime = 0;
  sponsorVideo.play().catch(() => {
    // Autoplay may be blocked, that's ok - user can watch or skip
  });
}

// Continue from sponsor screen to game
function continueSponsorToGame() {
  const sponsorVideo = document.getElementById("sponsorVideo");

  // Pause and reset video
  sponsorVideo.pause();
  sponsorVideo.currentTime = 0;

  // Show the game screen
  show(document.getElementById("gameScreen"));
}

// Reset game (back to start screen)
function resetGame() {
  if (!confirm("Reset board AND scores (keep team names/signatures)?")) return;

  const oldTeams = state.teams;
  state = freshState();
  state.teams = oldTeams?.length ? oldTeams : freshState().teams;
  state.teams.forEach(t => t.score = 0);
  state.used = {};
  state.dailyDoubles = {};

  saveState();

  const teamCountEl = document.getElementById("teamCount");
  const ddCountEl = document.getElementById("ddCount");
  
  teamCountEl.value = String(state.teams.length || 3);
  ddCountEl.value = String(state.ddCount ?? 1);

  renderBoard();
  renderScoreStrips();
  show(document.getElementById("startScreen"));
}

function clearAllTeams() {
  if (!confirm("Clear all team names and signatures? (Scores will be reset to $0)")) return;
  
  const teamCount = state.teams.length;
  state.teams = [];
  for (let i = 0; i < teamCount; i++) {
    state.teams.push({
      name: `TEAM ${i + 1}`,
      score: 0,
      sig: null
    });
  }
  
  saveState();
  renderScoreStrips();
}

function setupSegmented(segId, selectId) {
  const seg = document.getElementById(segId);
  const select = document.getElementById(selectId);

  const active = seg.querySelector(`button[data-value="${select.value}"]`);
  if (active) active.classList.add("active");

  seg.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-value]");
    if (!btn) return;

    seg.querySelectorAll("button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    select.value = btn.dataset.value;
    select.dispatchEvent(new Event("change"));
  });
}

// Initialize the application
function init() {
  // Load saved state (if exists)
  loadState();

  // Normalize state if needed
  if (!state.teams || state.teams.length < 2) {
    state = freshState();
  }

  const teamCountEl = document.getElementById("teamCount");
  const ddCountEl = document.getElementById("ddCount");

  teamCountEl.value = String(state.teams.length || 3);
  ddCountEl.value = String(state.ddCount ?? 1);

  // Ensure start preview scores are $0
  state.teams.forEach(t => t.score = t.score ?? 0);
  setupSegmented("teamCountSeg", "teamCount");
  setupSegmented("ddCountSeg", "ddCount");

  saveState();

  // Render initial state
  renderBoard();
  renderScoreStrips();
  show(document.getElementById("startScreen"));

  // Initialize animations
  initTitleStars();

  // Initialize modals
  initTeamModal();
  initClueOverlay();

  // Event handlers
  document.getElementById("clearTeamsBtn").addEventListener("click", clearAllTeams);
  document.getElementById("startBtn").addEventListener("click", newGame);
  document.getElementById("resetBtn").addEventListener("click", resetGame);


  // TEST BUTTON - Remove this when done testing
  document.getElementById("testFJBtn").addEventListener("click", () => {
    // Mark all tiles as used to trigger FJ
    GAME.categories.forEach((cat, c) => {
      GAME.values.forEach((val, r) => {
        state.used[keyOf(c, r)] = true;
      });
    });
    saveState();
    renderBoard();
    checkForFinalJeopardy();
  });


  // Update preview when team count changes
  teamCountEl.addEventListener("change", () => {
    const n = parseInt(teamCountEl.value, 10);
    setTeamsCount(n);
    state.teams.forEach(t => t.score = 0);
    saveState();
    renderScoreStrips();
  });

  // Debug toggle handler
  document.getElementById("debugToggle").addEventListener("change", (e) => {
    const corner = document.querySelector(".corner");
    if (e.target.checked) {
      corner.style.display = ""; // Show debug buttons
    } else {
      corner.style.display = "none"; // Hide debug buttons
    }
  });

  // Sponsor video toggle handler
  document.getElementById("sponsorToggle").addEventListener("change", (e) => {
    showSponsorVideo = e.target.checked;
  });

  // Sponsor skip button handler
  document.getElementById("sponsorSkipBtn").addEventListener("click", () => {
    continueSponsorToGame();
  });

  // Auto-continue when sponsor video ends
  document.getElementById("sponsorVideo").addEventListener("ended", () => {
    continueSponsorToGame();
  });
}

// Start the app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
