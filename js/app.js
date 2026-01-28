/***********************
 * MAIN APPLICATION
 * 
 * Initializes the game and coordinates all modules
 ***********************/

// Start a new game
function newGame() {
  const teamCountEl = document.getElementById("teamCount");
  const ddCountEl = document.getElementById("ddCount");
  const sponsorToggle = document.getElementById("sponsorToggle");
  
  const teamCount = parseInt(teamCountEl.value, 10);
  const ddCount = parseInt(ddCountEl.value, 10);
  const sponsorEnabled = sponsorToggle.checked;

  setTeamsCount(teamCount);

  state.used = {};
  state.ddCount = ddCount;
  randomizeDailyDoubles(ddCount);

  // Reset scores (keep names/signatures)
  state.teams.forEach(t => t.score = 0);

  saveState();
  renderBoard();
  renderScoreStrips();
  
  // Check if sponsor is enabled
  if (sponsorEnabled) {
    showSponsorIntro();
  } else {
    show(document.getElementById("gameScreen"));
  }
}

// Show sponsor intro button
function showSponsorIntro() {
  const overlay = document.getElementById("sponsorIntro");
  const btn = document.getElementById("sponsorIntroBtn");
  
  // Hide start screen
  document.getElementById("startScreen").classList.remove("show");
  
  // Show sponsor intro
  overlay.classList.add("show");
  
  // Button click handler
  btn.onclick = () => {
    btn.style.opacity = "0";
    
    setTimeout(() => {
      overlay.classList.remove("show");
      showSponsorVideo();
    }, 500); // Match the fade duration
  };
}

// Show sponsor video popup
function showSponsorVideo() {
  const popup = document.getElementById("sponsorVideoPopup");
  const content = popup.querySelector(".sponsor-video-content");
  
  // Clear any previous content
  content.innerHTML = "";
  
  // Create background video (blurred)
  const bgVideo = document.createElement("video");
  bgVideo.src = "assets/videos/sponsor.mp4";
  bgVideo.className = "sponsor-bg-video";
  bgVideo.preload = "auto";
  bgVideo.autoplay = true;
  bgVideo.playsInline = true;
  bgVideo.muted = true; // Background is muted
  bgVideo.loop = false;
  
  // Create foreground video (main)
  const video = document.createElement("video");
  video.src = "assets/videos/sponsor.mp4";
  video.className = "sponsor-fg-video";
  video.preload = "auto";
  video.autoplay = true;
  video.playsInline = true;

  // Create replay button using custom SVG
  const replayBtn = document.createElement("button");
  replayBtn.className = "sponsor-replay-btn";
  replayBtn.style.display = "none"; // Hidden by default
  
  // Add SVG as img inside button
  const replayIcon = document.createElement("img");
  replayIcon.src = "assets/replay.svg";
  replayIcon.style.width = "100%";
  replayIcon.style.height = "100%";
  replayIcon.style.filter = "brightness(0) saturate(100%) invert(70%) sepia(50%) saturate(800%) hue-rotate(160deg) brightness(95%) contrast(90%)";
  replayBtn.appendChild(replayIcon);

  // Replay button click handler
  replayBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    video.currentTime = 0;
    bgVideo.currentTime = 0;
    video.play();
    bgVideo.play();
    replayBtn.style.display = "none";
    continueBtn.style.opacity = "0";
    continueBtn.style.pointerEvents = "none";
  });
  
  // Video ended handler - show replay button AND continue button
  video.addEventListener("ended", () => {
    replayBtn.style.display = "flex";
    continueBtn.style.opacity = "1";
    continueBtn.style.pointerEvents = "auto";
  });
  
  // Sync background video with foreground
  video.addEventListener("play", () => bgVideo.play());
  video.addEventListener("pause", () => bgVideo.pause());
  video.addEventListener("seeked", () => {
    bgVideo.currentTime = video.currentTime;
  });

  
  // Create continue button (gold arrow button like FJ category/question screens)
  const continueBtn = document.createElement("button");
  continueBtn.className = "btn gold fj-arrow";
  continueBtn.innerHTML = "&rarr;";
  continueBtn.style.opacity = "0";
  continueBtn.style.pointerEvents = "none";
  continueBtn.style.transition = "opacity 1s ease";
  continueBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeSponsorVideo();
  });
  
  // Add video, replay button, and continue button to content
  content.appendChild(bgVideo);
  content.appendChild(video);
  content.appendChild(replayBtn);
  content.appendChild(continueBtn);
  
  // Show popup with fade-in
  
  // Show popup with fade-in
  popup.style.display = "flex";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      popup.classList.add("show");
    });
  });
  
  // Click background to close and go to game
  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      closeSponsorVideo();
    }
  });
  
  // Prevent clicks on video/button from closing popup
  content.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}


// Close sponsor video and proceed to game
function closeSponsorVideo() {
  const popup = document.getElementById("sponsorVideoPopup");
  
  // Fade out
  popup.classList.remove("show");
  
  // Wait for fade, then cleanup and show game
  setTimeout(() => {
    const video = popup.querySelector("video");
    if (video) {
      video.pause();
      video.currentTime = 0;
      video.removeAttribute("src");
      video.load();
    }
    
    popup.style.display = "none";
    popup.querySelector(".sponsor-video-content").innerHTML = "";
    
    // Show game screen
    show(document.getElementById("gameScreen"));
  }, 400); // Match transition duration
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
  // Sponsor toggle handler (for now just logs state)
  document.getElementById("sponsorToggle").addEventListener("change", (e) => {
    console.log("Sponsor toggle:", e.target.checked ? "ON" : "OFF");
  });
}

// Start the app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
