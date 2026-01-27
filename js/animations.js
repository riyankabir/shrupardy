/***********************
 * TITLE SCREEN ANIMATIONS
 * 
 * Handles the starfield animation on the start screen
 ***********************/

function initTitleStars(containerId = "titleStars") {
  const host = document.getElementById(containerId);
  if (!host) return;

  // Clear any existing stars
  host.innerHTML = "";

  const STAR_COUNT = 46;
  
  // Helper functions
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  function randi(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  // Spawn or respawn a star with random properties
  function spawnStar(star) {
    const size = randi(1, 22);
    const x = rand(0, window.innerWidth);
    const y = rand(0, window.innerHeight);

    const dx = rand(-90, 90) + "px";
    const dy = rand(-70, 70) + "px";
    const tw = rand(3.8, 6.2) + "s";        // twinkle period
    const dr = rand(14, 26) + "s";          // drift period
    const op = rand(0.18, 0.65).toFixed(2); // peak opacity
    const dly = rand(2, 4.55).toFixed(2) + "s";

    const r0 = randi(0, 360) + "deg";
    const r1 = (randi(0, 360) * (Math.random() < 0.5 ? -1 : 1)) + "deg";
    const r2 = randi(0, 360) + "deg";

    star.style.left = x + "px";
    star.style.top = y + "px";
    star.style.setProperty("--s", size + "px");
    star.style.setProperty("--dx", dx);
    star.style.setProperty("--dy", dy);
    star.style.setProperty("--tw", tw);
    star.style.setProperty("--dr", dr);
    star.style.setProperty("--op", op);
    star.style.setProperty("--dly", dly);
    star.style.setProperty("--r0", r0);
    star.style.setProperty("--r1", r1);
    star.style.setProperty("--r2", r2);
  }

  // Create a single star element
  function makeStar() {
    const star = document.createElement("div");
    star.className = "star";
    spawnStar(star);

    // "Teleport" - respawn after some time so stars appear/disappear
    const respawn = () => {
      spawnStar(star);
      star._t = setTimeout(respawn, randi(9000, 18000));
    };
    star._t = setTimeout(respawn, randi(2500, 7000));

    return star;
  }

  // Create all stars
  const stars = Array.from({ length: STAR_COUNT }, makeStar);
  stars.forEach(s => host.appendChild(s));

  // On resize, re-randomize positions so they don't clump
  window.addEventListener("resize", () => {
    stars.forEach(s => spawnStar(s));
  }, { passive: true });
}
