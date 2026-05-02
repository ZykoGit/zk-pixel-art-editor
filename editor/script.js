const GRID_SIZE = 50;
const grid = document.getElementById("grid");
const colorPicker = document.getElementById("colorPicker");
const brushBtn = document.getElementById("brushBtn");
const eraserBtn = document.getElementById("eraserBtn");
const clearBtn = document.getElementById("clearBtn");

let isDrawing = false;
let tool = "brush"; // "brush" or "eraser"

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
});

// Paint logic
function paint(target) {
  if (!target.classList.contains("pixel")) return;

  if (tool === "brush") {
    target.style.backgroundColor = colorPicker.value;
  } else {
    target.style.backgroundColor = "#111";
  }
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

// Touch events
grid.addEventListener("touchstart", e => {
  e.preventDefault();
  isDrawing = true;
  for (const touch of e.touches) {
    paint(document.elementFromPoint(touch.clientX, touch.clientY));
  }
}, { passive: false });

grid.addEventListener("touchmove", e => {
  e.preventDefault();
  if (!isDrawing) return;
  for (const touch of e.touches) {
    paint(document.elementFromPoint(touch.clientX, touch.clientY));
  }
}, { passive: false });

window.addEventListener("touchend", () => {
  isDrawing = false;
});
