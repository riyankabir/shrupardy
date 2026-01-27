/***********************
 * MODALS
 * 
 * Handles score editing modal and team editing modal
 ***********************/

let editingTeamIdx = null;
// canvasModified is declared in signature.js

// === SCORES MODAL (edit all scores) ===

function openScoresModal() {
  const scoresModal = document.getElementById("scoresModal");
  const scoresGrid = document.getElementById("scoresGrid");
  
  scoresGrid.innerHTML = "";
  const inputs = [];

  state.teams.forEach((t, idx) => {
    const row = document.createElement("div");
    row.className = "score-edit-row";

    const name = document.createElement("div");
    name.className = "score-edit-name";
    name.textContent = (t.name || `TEAM ${idx + 1}`).toUpperCase();

    const wrap = document.createElement("div");
    wrap.className = "money-input-wrap";

    const prefix = document.createElement("div");
    prefix.className = "money-prefix";
    prefix.textContent = GAME.currency;

    const inp = document.createElement("input");
    inp.type = "number";
    inp.value = String(t.score ?? 0);

    wrap.appendChild(prefix);
    wrap.appendChild(inp);

    inputs.push({ idx, inp });
    row.appendChild(name);
    row.appendChild(wrap);
    scoresGrid.appendChild(row);
  });

  scoresModal.classList.add("show");

  // Save handler
  document.getElementById("scoresSave").onclick = () => {
    inputs.forEach(({ idx, inp }) => {
      const val = parseInt(inp.value, 10);
      state.teams[idx].score = Number.isFinite(val) ? val : 0;
    });
    saveState();
    renderScoreStrips();
    scoresModal.classList.remove("show");
  };

  // Cancel handler
  document.getElementById("scoresCancel").onclick = () => {
    scoresModal.classList.remove("show");
  };
}

// === TEAM MODAL (edit name + signature) ===

function openTeamModal(teamIdx) {
  editingTeamIdx = teamIdx;
  canvasModified = false; // Reset modification tracking
  const t = state.teams[teamIdx];

  const teamModal = document.getElementById("teamModal");
  const teamModalTitle = document.getElementById("teamModalTitle");
  const teamNameInput = document.getElementById("teamNameInput");
  const sigCanvas = document.getElementById("sigCanvas");
  const ctx = sigCanvas.getContext("2d");

  teamModalTitle.textContent = `Edit Team ${teamIdx + 1}`;
  teamNameInput.value = t.name || `TEAM ${teamIdx + 1}`;

  // Setup canvas (white background + drawing config)
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, sigCanvas.width, sigCanvas.height);
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Load existing signature if present (convert back to black-on-white for editing)
  if (t.sig) {
    signatureToBlackOnWhite(t.sig).then(editableDataUrl => {
      if (editableDataUrl) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, sigCanvas.width, sigCanvas.height);
        };
        img.onerror = () => {
          console.error("Failed to load signature for editing");
        };
        img.src = editableDataUrl;
      }
    }).catch(err => {
      console.error("Error converting signature:", err);
    });
  }

  teamModal.classList.add("show");
}

function closeTeamModal() {
  document.getElementById("teamModal").classList.remove("show");
  editingTeamIdx = null;
}

// Initialize team modal event handlers
function initTeamModal() {
  const teamModal = document.getElementById("teamModal");
  const sigCanvas = document.getElementById("sigCanvas");
  const ctx = sigCanvas.getContext("2d");

  // Initialize signature drawing
  initSignatureCanvas(sigCanvas, ctx);

  // Clear button
  document.getElementById("sigClear").addEventListener("click", () => {
    clearCanvas(sigCanvas, ctx);
    canvasModified = true; // Mark as modified
  });

  // Cancel button
  document.getElementById("teamCancel").addEventListener("click", closeTeamModal);

  // Save button
  document.getElementById("teamSave").addEventListener("click", async () => {
    if (editingTeamIdx == null) return;

    // Always update team name
    state.teams[editingTeamIdx].name = 
      document.getElementById("teamNameInput").value || `TEAM ${editingTeamIdx + 1}`;

    // Handle signature updates
    if (canvasModified) {
      // User explicitly modified canvas (drew or cleared)
      if (isCanvasBlank(sigCanvas)) {
        // Canvas is blank after modification -> remove signature
        state.teams[editingTeamIdx].sig = null;
      } else {
        // Canvas has content -> save new signature
        const raw = sigCanvas.toDataURL("image/png");
        state.teams[editingTeamIdx].sig = await signatureToWhiteTransparent(raw);
      }
    }
    // If not modified, keep existing signature unchanged

    saveState();
    renderScoreStrips();
    closeTeamModal();
  });
}