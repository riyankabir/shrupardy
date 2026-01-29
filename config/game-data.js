/***********************
 * GAME CONFIGURATION
 * 
 * Edit this file to customize your game!
 * - currency: The symbol shown for money values
 * - values: Point values for each row (5 rows)
 * - categories: Array of 6 categories, each with 5 clues
 ***********************/

const GAME = {
  currency: "$",
  
  // Point values for each row (must have exactly 5 values)
  values: [400, 800, 1200, 1600, 2000],
  
  // Categories (must have exactly 6 categories, each with 5 clues)
  categories: [
    {
      name: "ALL ABOUT\nSHRUTI",
      desc: "You know what it's all about, don't ask stupid questions.",
      clues: [
        { q: "Her middle name - not to be confused with her middle initial", a: "What is 'A'?" },
        { q: "Her first concert", a: "What is One Direction?" },
        { q: "Her shoe size", a: "What is 5.5 or 6?" },
        { q: "Her year as Fairfax County spelling champion ", a: "What is 2011?" },
        { q: "Her birth city and locale of her mother’s pediatrics residency", a: "What is Richmond, VA?" },
      ]
    },
    {
      name: "CHRONICALLY\nONLINE",
      desc: "You can find her on @shruti417, @shrutilens, @shrot8, @shrutianant8 or @shrutiiia",
      clues: [
        { q: "Renewed online nostalgia for pop culture icons like the Chainsmokers, Pokemon Go, Vine, King Kylie and the Snapchat dog filter - artifacts from the not-so-distant pre-pandemic era - has people saying #2026isthenew, this year.", 
          a: "What is 2016?" },
        { q: "This Queens native and notorious Twitter user voiced his support on the platform for fellow New Yorker detained overseas, posting<br><br>\"A$AP Rocky released from prison and on his way home to the United States from Sweden. It was a Rocky Week, get home ASAP A$AP!\"", 
          a: "Who is Donald Trump?" },
        { q: "A campaign video featured Mindy Kaling and Kamala Harris preparing this regional dish - one of Shruti’s favorites - which is made of fermented batter and a spiced filling.", 
          a: "What is Masala Dosa?" },
        { q: "Young hoes cook everything on high; Young hoes don't preheat the airfryer; Young hoes press +30s on the microwave instead of typing out the number; Young hoes don’t wait to warm up their car, they leave when the bluetooth connects<br><br>How do young hoes do laundry?",
          a: "What is not separated or one big-ass load? (Will accept on hot or with the quick cycle or another answer if it's funny)",
          m: "audio:assets/audios/chronic800.m4a"},
        { q: "Before copycat contests spread nationwide, the original gathering of lookalikes in Washington Square Park paid tribute to this young Oscar-nominated actor.", 
          a: "Who is Timotheé Chalamet?" },
      ]
    },
    {
      name: "SCREEN OR\nSONG",
      desc: "Her two love languages: Netflix and Spotify",
      clues: [
        { q: "\"So pick me. Choose me. Love me\"", 
          a: "What is TV Show, Grey's Anatomy, Meredith Grey played by Ellen Pompeo?" },
        { q: "\"I may be bad but I’m perfectly good at it\"", 
          a: "What is Song, 'S&M' on <i>Loud<i>, Rihanna?" },
        { q: "\"But what you don't know is that that sweater is not just blue, it's not turquoise, it's not lapis, it's actually cerulean.\"", 
          a: "What is Movie, Devil Wears Prada, Miranda Priestley played by Meryl Streep?"},
        { q: "\"After he literally did his big one up there. That was like a movie. He stood up there and said, 'Now... you're sending three home' and then you're still here, b*tch, in your overalls. Now what?\"",
          a: "What is TV Show, Love Island USA, Leah Kateb?"},
        { q: "\"You would think we live in Baltimore, the way they Raven 'bout the latest product\"", 
          a: "What is Song, 'Middle of the Ocean' on <i>Her Loss<i>, Drake?" },
      ]
    },
    {
      name: "ASK A LOCAL",
      desc: "Places Shruti has lived, loved, and complained about",
      clues: [
        { q: "Major highways like I-95, I-66 and US Route 1 connect the entire DMV region and become the Woodrow Wilson, Theodore Roosevelt, and 14th Street Bridges, respectively, over this body of water.",
          a: "What is the Potomac River?" },
        { q: "1.7 miles, 0.5 miles, 1.2 miles<br>These aren't awkward race splits, but rather the distances from her past and present homes to the nearest location of this fast-casual restaurant that holds a special place in her heart.", 
          a: "What is Chipotle?" },
        { q: "Founded just three years apart in the late 19th century, the local universities of Nashville and Baltimore — Vanderbilt University and Johns Hopkins University — were endowed by philanthropists whose fortunes both came from this industry.", 
          a: "What is the railroad industry?" },
        { q: "Because of its early reputation as a center of education, Nashville earned a nickname invoking this city - but ‘of the South’ - which later inspired the construction of a full scale Parthenon replica and the mythological name of its NFL team.", 
          a: "What is Athens?" },
        { q: "With rum drinks, raunchy pirate nicknames, and raucous dancing on the water, this Fells Point party cruise company offers the full experience for would-be metropolitan marauders, downtown buccaneers, and city scoundrels.",
          a: "What is <i>Urban Pirates<i>?",
          m: "video:assets/videos/askALocalMalini.mp4"},

      ]
    },
    {
      name: "APRIL 17TH",
      desc: "Her birth, and other less important historical events",
      clues: [
        { q: "Born on this day in 1974, this former girl group star - also famed for her footballer husband and luxury fashion line - recently found herself feuding with her firstborn over spicy family drama at his nuptials to an equally posh billionaire heiress.", 
          a: "Who is Victoria Beckham?" },
        { q: "First airing on Shruti’s 12th birthday, this hit HBO fantasy epic featuring feuding noble houses and mythical creatures was hardly meant for middle school audiences.", 
          a: "What is Game of Thrones?" },
        { q: "Debuting on this day at the 1964 New York World’s Fair, this Ford model became an instant American classic and launched the segment of cars aptly named ‘pony cars.’", 
          a: "What is the Ford Mustang?" },
        { q: "On this day in 2022, I skipped the infamous Shruchella to attend its namesake festival, where this controversial - and recently apologetic - artist was slated to  headline the final night before dropping out.", 
          a: "Who is Kanye West?" },
        { q: "On this day every<br><br>year, keen writers observe this<br><br>Pseudo-Holiday.", 
          a: "What is National Haiku Day?" },
      ]
    },
    {
      name: "S-P-E-L-L\nI-T O-U-T",
      desc: "Can you spell better than Shruti at age 13?",
      clues: [
        { q: "This school has not educated any presidents (yet), but was like a magnet that attracted a few in this room and is better known by this official acronym.", 
          a: "What is T-J-H-S-S-T?" },
        { q: "This college quadrangle - named after the fourth Chancellor of Shruti’s alma mater - was once considered a rite of passage for socially minded young men and women until its closure last year.", 
          a: "What is B-R-A-N-S-C-O-M-B?" },
        { q: "In her upcoming residency, Shruti will be training to become this subspecialist.", 
          a: "What is O-P-H-T-H-A-L-M-O-L-O-G-I-S-T?" },
        { q: "Shruti's promising spelling career met its untimely demise when she misspelled this verb.<br><br>Definition: to remove the moisture from (something); cause to become completely dry.<br><br>Pronunciation: /ˈdesəˌkāt/", 
          a: "What is D-E-S-I-C-C-A-T-E?",
          m: "audio:assets/audios/spell800.m4a"},
        { q: "Before Shruti learned of this inflammation of the iris and ciliary body, a Vine immortalized the term thanks to the intense pronunciation of bespectacled National Spelling Bee contestant Dev Jaiswal.", 
          a: "What is I-R-I-D-O-C-Y-C-L-I-T-I-S?",
          m: "video:assets/videos/spell1000.mp4",
          p: false },
      ]
    },
  ],

  // Final Jeopardy configuration
  finalJeopardy: {
    category: "THE CITY OF ANGELS",
    question: "Our future doctor may frequent Barry’s West Hollywood not just for fitness, but also in hopes of spotting this celeb, a known regular and her former teen crush - if he ever gets hurt and needs stitches, she’ll be ready for their meet-cute.",
    answer: "What is NEED TO ADD?",
    timings: {
      buttonFade: 500,        // Button fade out duration (ms)
      screenTransition: 300,  // Screen transition duration (ms)
      scoreboardDelay: 20000, // Delay before scoreboard button appears (ms)
      raysRotation: 25000,    // Rotating rays animation duration (ms)
      revealSpin: 4000,       // Reveal button spin duration (ms)
      revealGlow: 2000,       // Reveal button glow pulse duration (ms)
    }
  }
};