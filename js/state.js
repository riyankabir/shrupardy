/***********************
 * STATE MANAGEMENT
 * 
 * Handles game state and localStorage persistence
 ***********************/

const STORAGE_KEY = "shrupardy_state_v4";

// Helper to create tile key
const keyOf = (c, r) => `${c}:${r}`;

// Create fresh initial state
function freshState() {
  return {
    used: {},
    dailyDoubles: {},
    ddCount: 1,
    teams: [
      { name: "TEAM 1", score: 0, sig: null },
      { name: "TEAM 2", score: 0, sig: null },
      { name: "TEAM 3", score: 0, sig: null },
    ]
  };
}

// Initialize state
let state = freshState();

// Current clue tracking
let currentTile = null;     // {c, r}
let currentValue = 0;       // Current clue value or wager
let currentClueAdjustments = {}; // { teamIdx: -1 | 0 | 1 } - tracks adjustment state per team

// Save state to localStorage
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Load state from localStorage
function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return false;
    
    state = parsed;
    state.used ||= {};
    state.dailyDoubles ||= {};
    state.teams ||= [];
    state.ddCount ??= 1;
    
    return true;
  } catch {
    return false;
  }
}

// Set number of teams (preserves existing team data when possible)
function setTeamsCount(n) {
  const next = [];
  for (let i = 0; i < n; i++) {
    next.push({
      name: state.teams[i]?.name || `TEAM ${i + 1}`,
      score: state.teams[i]?.score ?? 0,
      sig: state.teams[i]?.sig || null
    });
  }
  state.teams = next;
}

// Randomize daily double positions
function randomizeDailyDoubles(count) {
  state.dailyDoubles = {};
  if (count <= 0) return;

  // Build list of allowed tiles (avoid $200 row)
  const allowed = [];
  for (let c = 0; c < GAME.categories.length; c++) {
    for (let r = 1; r < GAME.values.length; r++) {
      allowed.push({ c, r });
    }
  }

  // Shuffle using Fisher-Yates
  for (let i = allowed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allowed[i], allowed[j]] = [allowed[j], allowed[i]];
  }

  // Pick first N tiles
  for (let k = 0; k < Math.min(count, allowed.length); k++) {
    const t = allowed[k];
    state.dailyDoubles[keyOf(t.c, t.r)] = true;
  }
}
