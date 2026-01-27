/***********************
 * SIGNATURE DRAWING
 * 
 * Handles canvas drawing and signature conversion
 * 
 * Color space conversions:
 * - DISPLAY (podium): White strokes on transparent background
 * - EDITING (canvas): Black strokes on white background
 ***********************/

// === CONFIGURATION ===
const SIGNATURE_CONFIG = {
  // Canvas settings
  canvasWidth: 1200,
  canvasHeight: 360,
  strokeWidth: 8,
  strokeColor: "#111", // Dark grey for drawing
  backgroundColor: "#fff", // White background
  
  // Conversion thresholds
  opacityThreshold: 100,  // Alpha > 100 = signature stroke
  whiteThreshold: 240,    // RGB > 240 = white pixel
  darkThreshold: 80,      // RGB < 80 = dark pixel
};

// === STATE ===
let drawing = false;
let last = null;
let canvasModified = false; // Global flag to track if canvas was drawn on

// === COLOR CONVERSION FUNCTIONS ===

/**
 * Convert black-on-white signature to white-on-transparent
 * Used when saving signature for display on podiums
 * @param {string} dataUrl - Canvas data URL (black strokes on white)
 * @returns {Promise<string>} - Converted data URL (white strokes on transparent)
 */
function signatureToWhiteTransparent(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = imageData;
      
      // Convert each pixel
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const isWhiteBackground = (
          r > SIGNATURE_CONFIG.whiteThreshold && 
          g > SIGNATURE_CONFIG.whiteThreshold && 
          b > SIGNATURE_CONFIG.whiteThreshold
        );
        
        const isDarkStroke = (
          r < SIGNATURE_CONFIG.darkThreshold && 
          g < SIGNATURE_CONFIG.darkThreshold && 
          b < SIGNATURE_CONFIG.darkThreshold
        );

        if (isWhiteBackground) {
          // White background -> transparent
          data[i + 3] = 0;
        } else if (isDarkStroke) {
          // Dark strokes -> white strokes
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = 255;
        } else {
          // Midtones -> white with reduced opacity
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = Math.min(200, data[i + 3]);
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    
    img.onerror = () => {
      reject(new Error("Failed to load signature for conversion to display format"));
    };
    
    img.src = dataUrl;
  });
}

/**
 * Convert white-on-transparent signature to black-on-white
 * Used when loading signature into canvas for editing
 * @param {string} dataUrl - Stored signature (white strokes on transparent)
 * @returns {Promise<string>} - Converted data URL (black strokes on white)
 */
function signatureToBlackOnWhite(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Create temp canvas to read the white-on-transparent signature
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(img, 0, 0);
      
      // Get the image data
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const { data } = imageData;
      
      // Convert: white strokes on transparent -> black strokes on white
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        
        const isSignatureStroke = alpha > SIGNATURE_CONFIG.opacityThreshold;
        
        if (isSignatureStroke) {
          // Signature stroke -> black
          data[i] = 34;      // Dark grey (easier to see than pure black)
          data[i + 1] = 34;
          data[i + 2] = 34;
          data[i + 3] = 255;
        } else {
          // Transparent background -> white
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = 255;
        }
      }
      
      // Put the converted data onto a final canvas
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = img.width;
      finalCanvas.height = img.height;
      const finalCtx = finalCanvas.getContext("2d");
      finalCtx.putImageData(imageData, 0, 0);
      
      resolve(finalCanvas.toDataURL("image/png"));
    };
    
    img.onerror = () => {
      reject(new Error("Failed to load signature for editing"));
    };
    
    img.src = dataUrl;
  });
}

// === CANVAS DRAWING ===

/**
 * Initialize signature canvas with pointer event handlers
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {CanvasRenderingContext2D} ctx - The canvas 2D context
 */
function initSignatureCanvas(canvas, ctx) {
  // Get pointer position relative to canvas
  function pointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  }

  // Mouse/touch down
  canvas.addEventListener("pointerdown", (e) => {
    drawing = true;
    last = pointerPos(e);
  });

  // Mouse/touch move
  canvas.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    const p = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
    canvasModified = true; // Mark as modified
  });

  // Mouse/touch up (global to catch releases outside canvas)
  window.addEventListener("pointerup", () => {
    drawing = false;
    last = null;
  });
}

/**
 * Clear canvas to white background
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {CanvasRenderingContext2D} ctx - The canvas 2D context
 */
function clearCanvas(canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = SIGNATURE_CONFIG.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}


/**
 * Check if canvas contains any signature (i.e., not all white)
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @returns {boolean} - True if canvas is blank/empty
 */
function isCanvasBlank(canvas) {
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;
  
  // Check if all pixels are white
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // If any pixel is not white, canvas has content
    if (r < 250 || g < 250 || b < 250) {
      return false;
    }
  }
  
  return true;
}
