const GRID_SIZE = 50;
const grid = document.getElementById("grid");
const colorPicker = document.getElementById("colorPicker");
const brushBtn = document.getElementById("brushBtn");
const eraserBtn = document.getElementById("eraserBtn");
const clearBtn = document.getElementById("clearBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

let isDrawing = false;
let tool = "brush";

// Pan + zoom state
let scale = 1;
let panX = 0;
let panY = 0;
let lastTouch = null;

// Build grid
function createGrid() {
  grid.innerHTML = "";
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const pixel = document.createElement("div");
    pixel.classList.add("pixel");
    grid.appendChild(pixel);
  }
}

createGrid();

// Load saved art
function loadSavedArt() {
  const saved = localStorage.getItem("pixelArt");
  if (!saved) return;

  const colors = JSON.parse(saved);
  const pixels = document.querySelectorAll(".pixel");

  pixels.forEach((pixel, i) => {
    pixel.style.backgroundColor = colors[i] || "#111";
  });
}

loadSavedArt();

// Save art
function saveArt() {
  const pixels = document.querySelectorAll(".pixel");
  const colors = Array.from(pixels).map(p => p.style.backgroundColor);
  localStorage.setItem("pixelArt", JSON.stringify(colors));
}

// Tool switching
brushBtn.addEventListener("click", () => {
  tool = "brush";
  brushBtn.classList.add("active");
  eraserBtn.classList.remove("active");
});

eraserBtn.addEventListener("click", () => {
  tool = "eraser";
  eraserBtn.classList.add("active");
  brushBtn.classList.remove("active");
});

// Clear grid
clearBtn.addEventListener("click", () => {
  document.querySelectorAll(".pixel").forEach(p => {
    p.style.backgroundColor = "#111";
  });
  saveArt();
});

// Paint logic
function paint(target) {
  if (!target.classList.contains("pixel")) return;

  if (tool === "brush") {
    target.style.backgroundColor = colorPicker.value;
  } else {
    target.style.backgroundColor = "#111";
  }

  saveArt();
}

// Mouse events
grid.addEventListener("mousedown", e => {
  isDrawing = true;
  paint(e.target);
});

window.addEventListener("mouseup", () => {
  isDrawing = false;
});

grid.addEventListener("mousemove", e => {
  if (isDrawing) paint(e.target);
});

// Touch drawing
grid.addEventListener("touchstart", e => {
  if (e.touches.length === 1) {
    e.preventDefault();
    isDrawing = true;
    paint(document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY));
  }
}, { passive: false });

grid.addEventListener("touchmove", e => {
  if (e.touches.length === 1 && isDrawing) {
    e.preventDefault();
    paint(document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY));
  }
}, { passive: false });

window.addEventListener("touchend", () => {
  isDrawing = false;
});

// ----------------------
// PAN + ZOOM
// ----------------------

function applyTransform() {
  grid.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
}

// Pinch zoom
grid.addEventListener("touchmove", e => {
  if (e.touches.length === 2) {
    e.preventDefault();

    const [t1, t2] = e.touches;
    const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

    if (!lastTouch) {
      lastTouch = dist;
      return;
    }

    const delta = dist - lastTouch;
    scale += delta * 0.002;
    scale = Math.max(0.5, Math.min(scale, 4));

    lastTouch = dist;
    applyTransform();
  }
}, { passive: false });

window.addEventListener("touchend", () => {
  lastTouch = null;
});

// Pan with two fingers
grid.addEventListener("touchmove", e => {
  if (e.touches.length === 2) {
    const [t1, t2] = e.touches;
    const midX = (t1.clientX + t2.clientX) / 2;
    const midY = (t1.clientY + t2.clientY) / 2;

    if (!grid.lastMid) {
      grid.lastMid = { x: midX, y: midY };
      return;
    }

    panX += midX - grid.lastMid.x;
    panY += midY - grid.lastMid.y;

    grid.lastMid = { x: midX, y: midY };
    applyTransform();
  }
}, { passive: false });

window.addEventListener("touchend", () => {
  grid.lastMid = null;
});

// ----------------------
// EXPORT PNG
// ----------------------

exportBtn.addEventListener("click", () => {
  const canvas = document.createElement("canvas");
  canvas.width = GRID_SIZE;
  canvas.height = GRID_SIZE;
  const ctx = canvas.getContext("2d");

  const pixels = document.querySelectorAll(".pixel");

  pixels.forEach((pixel, i) => {
    const x = i % GRID_SIZE;
    const y = Math.floor(i / GRID_SIZE);
    ctx.fillStyle = pixel.style.backgroundColor || "#111";
    ctx.fillRect(x, y, 1, 1);
  });

  const link = document.createElement("a");
  link.download = "pixel_art.png";
  link.href = canvas.toDataURL();
  link.click();
});

// ----------------------
// IMPORT PNG
// ----------------------

importBtn.addEventListener("click", () => importFile.click());

importFile.addEventListener("change", () => {
  const file = importFile.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = GRID_SIZE;
    canvas.height = GRID_SIZE;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0, GRID_SIZE, GRID_SIZE);
    const data = ctx.getImageData(0, 0, GRID_SIZE, GRID_SIZE).data;

    const pixels = document.querySelectorAll(".pixel");

    pixels.forEach((pixel, i) => {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      pixel.style.backgroundColor = `rgb(${r},${g},${b})`;
    });

    saveArt();
  };

  img.src = URL.createObjectURL(file);
});
