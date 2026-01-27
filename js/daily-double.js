/***********************
 * DAILY DOUBLE
 * 
 * Handles daily double overlay display and wager input
 ***********************/

// Show daily double overlay, get wager, then call next()
function showDailyDouble(next) {
  const ddOverlay = document.getElementById("ddOverlay");
  const wagerInput = document.getElementById("ddWagerInput");
  const continueBtn = document.getElementById("ddContinueBtn");
  
  // Reset wager to minimum clue value
  wagerInput.value = GAME.values[0] || 200;
  
  ddOverlay.classList.add("show");
  renderScoreStrips();
  
  // Focus input for easy editing
  setTimeout(() => wagerInput.focus(), 100);
  
  // Remove any previous listeners
  const newBtn = continueBtn.cloneNode(true);
  continueBtn.parentNode.replaceChild(newBtn, continueBtn);
  
  newBtn.addEventListener("click", () => {
    const wager = parseInt(wagerInput.value, 10) || 0;
    currentValue = wager; // Override current value with wager
    
    ddOverlay.classList.remove("show");
    next();
  });
}
