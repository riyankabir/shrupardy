/***********************
 * CLUE DISPLAY
 * 
 * Handles clue overlay and answer reveal
 ***********************/

// Open a tile (checks for daily double first)
function openTile(c, r) {
  currentTile = { c, r };
  currentValue = GAME.values[r] || 0;

  const k = keyOf(c, r);
  const isDD = !!state.dailyDoubles[k];

  if (isDD) {
    showDailyDouble(() => showClue(c, r));
  } else {
    showClue(c, r);
  }
}

// Show clue overlay
function showClue(c, r) {
  const clueOverlay = document.getElementById("clueOverlay");
  const clueTextEl = document.getElementById("clueText");
  const answerTextEl = document.getElementById("answerText");
  
  const clue = GAME.categories[c]?.clues?.[r] || { q: "", a: "" };
  
  // Always show the question text (no more video replacement)
  clueTextEl.innerHTML = (clue.q || "").toUpperCase();
  answerTextEl.innerHTML = (clue.a || "").toUpperCase();
  answerTextEl.classList.remove("show");
    
  // Show/hide media button based on whether clue has media
  const mediaBtn = document.getElementById("mediaBtn");
  if (clue.m) {
    mediaBtn.style.display = "flex";
    // Store media path for later use
    mediaBtn.dataset.mediaPath = clue.m;

    /// Auto-play video ONLY if autoplay is not explicitly false
    const shouldAutoplay = clue.p !== false; // Default to true
    const isVideo = clue.m.startsWith("video:");
    
    if (isVideo && shouldAutoplay) {
      // Small delay to ensure overlay is visible
      setTimeout(() => {
        playMedia(clue.m);
      }, 0);
    } 
  } else {
    mediaBtn.style.display = "none";
    mediaBtn.dataset.mediaPath = "";
  }
  
  // Reset any previous custom sizing for text clues
  clueTextEl.style.fontSize = "";
  answerTextEl.style.fontSize = "";
  
  clueOverlay.classList.add("show");
  renderScoreStrips();
  
  // After render, check if we need to resize (text only)
  requestAnimationFrame(() => {
    resizeClueIfNeeded();
  });
}

// Dynamically resize clue/answer to fit available space
function resizeClueIfNeeded() {
  const clueArea = document.querySelector(".clue-area");
  const clueContent = document.querySelector(".clue-content");
  const clueTextEl = document.getElementById("clueText");
  const answerTextEl = document.getElementById("answerText");
  const scoreStrip = document.getElementById("scoreStripClue");
  
  if (!clueArea || !clueContent || !scoreStrip) return;
  
  // Get available height (subtract score strip height)
  const scoreStripHeight = scoreStrip.offsetHeight;
  const totalHeight = window.innerHeight;
  const availableHeight = totalHeight - scoreStripHeight;
  
  // Get current content height
  const contentHeight = clueContent.scrollHeight;
  
  // Be more strict - leave 10% padding
  const targetHeight = availableHeight * 0.85;
  
  // If content fits comfortably, we're done
  if (contentHeight <= targetHeight) return;
  
  // Calculate scale factor needed
  const scaleFactor = targetHeight / contentHeight;
  
  // Get computed font sizes
  const clueStyle = window.getComputedStyle(clueTextEl);
  const answerStyle = window.getComputedStyle(answerTextEl);
  
  const clueFontSize = parseFloat(clueStyle.fontSize);
  const answerFontSize = parseFloat(answerStyle.fontSize);
  
  // Apply scaled font sizes with lower minimums to allow more shrinking
  clueTextEl.style.fontSize = Math.max(16, clueFontSize * scaleFactor) + "px";
  answerTextEl.style.fontSize = Math.max(12, answerFontSize * scaleFactor) + "px";
  
  // If still too tall after first resize, try again with even smaller fonts
  requestAnimationFrame(() => {
    const newContentHeight = clueContent.scrollHeight;
    if (newContentHeight > targetHeight) {
      const secondScaleFactor = targetHeight / newContentHeight;
      const currentClueSize = parseFloat(clueTextEl.style.fontSize);
      const currentAnswerSize = parseFloat(answerTextEl.style.fontSize);
      
      clueTextEl.style.fontSize = Math.max(14, currentClueSize * secondScaleFactor) + "px";
      answerTextEl.style.fontSize = Math.max(11, currentAnswerSize * secondScaleFactor) + "px";
    }
  });
}

function stopClueVideoIfAny() {
  const overlay = document.getElementById("clueOverlay");
  if (!overlay) return;

  const video = overlay.querySelector("video");
  if (!video) return;

  // Stop playback + release audio/buffer
  video.pause();
  video.currentTime = 0;

  // Remove src to fully stop in Safari/WebKit
  video.removeAttribute("src");
  video.querySelectorAll("source").forEach(s => s.removeAttribute("src"));
  video.load(); // flush

  // Optional: remove ended dim state if present
  overlay.querySelector(".video-container")?.classList.remove("ended");
}

// Close clue and mark tile as used
function closeClueAndMarkUsed() {
  if (!currentTile) return;

  // Close media popup if open
  closeMediaPopup();
  
  // Stop any audio that might be playing
  const audio = document.getElementById("clueAudioPlayer");
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  // stop any playing video before hiding
  stopClueVideoIfAny();

  state.used[keyOf(currentTile.c, currentTile.r)] = true;
  saveState();
  
  // Reset font sizes
  const clueEl = document.getElementById("clueText");
  const answerEl = document.getElementById("answerText");
  
  clueEl.style.fontSize = "";
  answerEl.style.fontSize = "";
  
  // Reset adjustment tracking for next clue
  currentClueAdjustments = {};
  
  document.getElementById("clueOverlay").classList.remove("show");
  currentTile = null;
  currentValue = 0;
  
  renderBoard();
  renderScoreStrips();
  
  // Check if ready for Final Jeopardy
  if (typeof checkForFinalJeopardy === 'function') {
    checkForFinalJeopardy();
  }
}

// Toggle answer visibility
function toggleAnswer() {
  const answerEl = document.getElementById("answerText");
  answerEl.classList.toggle("show");
}

// Play media in popup (video) or inline (audio)
function playMedia(mediaPath) {
  const mediaPopup = document.getElementById("mediaPopup");
  const mediaContent = mediaPopup.querySelector(".media-popup-content");
  
  // Determine media type
  const isVideo = mediaPath.startsWith("video:");
  const isAudio = mediaPath.startsWith("audio:");
  
  if (!isVideo && !isAudio) return;
  
  // Extract actual file path
  const filePath = mediaPath.substring(6); // Remove "video:" or "audio:" prefix
  
  if (isVideo) {
    // Ensure popup starts hidden for proper fade-in
    mediaPopup.classList.remove("show");
    mediaPopup.style.display = "none";
    
    // Clear previous media
    mediaContent.innerHTML = "";
    
    // Create video element
    const video = document.createElement("video");
    video.controls = false;
    video.autoplay = true;
    video.src = filePath;
    
    // Close popup when video ends (with delay)
    video.addEventListener("ended", () => {
      setTimeout(() => {
        closeMediaPopup();
      }, 1500); // 1.5 second delay before closing
    });
    
    mediaContent.appendChild(video);
    
    // Show popup with fade-in - force clean state
    mediaPopup.style.display = "flex";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        mediaPopup.classList.add("show");
      });
    });
  } else if (isAudio) {
    // Audio plays without popup
    // Check if audio already exists
    let audio = document.getElementById("clueAudioPlayer");
    
    if (!audio) {
      // Create hidden audio element
      audio = document.createElement("audio");
      audio.id = "clueAudioPlayer";
      audio.src = filePath;
      document.body.appendChild(audio);
    } else {
      // Update source if different
      if (audio.src !== window.location.origin + "/" + filePath) {
        audio.src = filePath;
      }
    }
    
    // If already playing, stop and reset
    if (!audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    } else {
      // Play from beginning
      audio.currentTime = 0;
      audio.play();
    }
  }
}


function closeMediaPopup() {
  const mediaPopup = document.getElementById("mediaPopup");
  const mediaContent = mediaPopup.querySelector(".media-popup-content");
  
  // Only fade out if currently showing
  if (mediaPopup.classList.contains("show")) {
    // Fade out first
    mediaPopup.classList.remove("show");
    
    // Wait for fade out to complete before cleanup
    setTimeout(() => {
      cleanupMediaPopup(mediaPopup, mediaContent);
    }, 400); // Match the transition duration
  } else {
    // Already hidden, just cleanup
    cleanupMediaPopup(mediaPopup, mediaContent);
  }
}

function cleanupMediaPopup(mediaPopup, mediaContent) {
  // Stop any playing media
  const video = mediaContent.querySelector("video");
  const audio = mediaContent.querySelector("audio");
  
  if (video) {
    video.pause();
    video.currentTime = 0;
    video.removeAttribute("src");
    video.load();
  }
  
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  
  // Clear and hide
  mediaContent.innerHTML = "";
  mediaPopup.style.display = "none";
}

// Setup media button and popup handlers
function initMediaHandlers() {
  const mediaBtn = document.getElementById("mediaBtn");
  const mediaPopup = document.getElementById("mediaPopup");
  
  // Media button click - play media
  mediaBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const mediaPath = mediaBtn.dataset.mediaPath;
    if (mediaPath) {
      playMedia(mediaPath);
    }
  });
  
  // Click outside video/audio to close popup
  mediaPopup.addEventListener("click", (e) => {
    // Only close if clicking the dark background, not the media element
    if (e.target === mediaPopup) {
      closeMediaPopup();
    }
  });
  
  // Prevent clicks on media content from closing popup
  const mediaContent = mediaPopup.querySelector(".media-popup-content");
  mediaContent.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

// Setup clue overlay buttons and keyboard
function initClueOverlay() {
  const backBtn = document.getElementById("backBtn");
  const revealBtn = document.getElementById("revealBtn");

  backBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeClueAndMarkUsed();
  });

  revealBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleAnswer();
  });

  // Keyboard shortcuts
  window.addEventListener("keydown", (e) => {
    const clueOverlay = document.getElementById("clueOverlay");
    if (clueOverlay.classList.contains("show")) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeClueAndMarkUsed();
      }
      if (e.key === " ") {
        e.preventDefault();
        toggleAnswer();
      }
    }
  });

    // Initialize media handlers
  initMediaHandlers();
}
