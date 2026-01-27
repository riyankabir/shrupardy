/***********************
 * BOARD RENDERING
 * 
 * Handles game board display and tile interactions
 ***********************/

// Render the game board
function renderBoard() {
  const boardEl = document.getElementById("board");
  boardEl.innerHTML = "";

  // Render category headers
  GAME.categories.forEach((cat) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    
    const t = document.createElement("div");
    t.className = "cat";
    t.innerHTML = (cat.name || "").replaceAll("\n", "<br>");
    
    cell.appendChild(t);
    
    // Add description if available
    if (cat.desc) {
      const desc = document.createElement("div");
      desc.className = "cat-desc";
      desc.textContent = cat.desc;
      cell.appendChild(desc);
    }
    
    boardEl.appendChild(cell);
  });

  // Render value tiles
  GAME.values.forEach((val, r) => {
    GAME.categories.forEach((cat, c) => {
      const k = keyOf(c, r);
      const used = !!state.used[k];

      const cell = document.createElement("div");
      cell.className = "cell tile" + (used ? " used" : "");

      const v = document.createElement("div");
      v.className = "value";
      
      const cur = document.createElement("span");
      cur.className = "currency";
      cur.textContent = GAME.currency;

      const amount = document.createElement("span");
      amount.className = "amount";
      amount.textContent = val;

      v.append(cur, amount);
      // v.textContent = `${GAME.currency}${val}`;
      cell.appendChild(v);

      // Click/Double-click handling with delay
      let clickTimer = null;
      
      // Single-click handler for unused tiles (opens clue with delay)
      if (!used) {
        cell.addEventListener("click", (e) => {
          e.stopPropagation();
          
          // Clear any existing timer
          if (clickTimer) {
            clearTimeout(clickTimer);
            clickTimer = null;
            return; // This was actually a double-click, ignore
          }
          
          // Set a delay to distinguish from double-click
          clickTimer = setTimeout(() => {
            clickTimer = null;
            if (!state.used[k]) {
              openTile(c, r);
            }
          }, 250); // 250ms delay
        });
      }

      // Double-click handler for ALL tiles (toggles used state)
      cell.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        
        // Clear the single-click timer
        if (clickTimer) {
          clearTimeout(clickTimer);
          clickTimer = null;
        }
        
        // Toggle tile state immediately
        if (used) {
          // Tile is used → make it unused
          delete state.used[k];
        } else {
          // Tile is unused → mark as used
          state.used[k] = true;
        }
        
        saveState();
        renderBoard();
        renderScoreStrips();

        // Check if ready for Final Jeopardy
        if (typeof checkForFinalJeopardy === 'function') {
          checkForFinalJeopardy();
        }
      });
      
      boardEl.appendChild(cell);
    });
  });
}

// Show specific screen
function show(screen) {
  document.getElementById("startScreen").classList.remove("show");
  document.getElementById("gameScreen").classList.remove("show");
  screen.classList.add("show");
}
