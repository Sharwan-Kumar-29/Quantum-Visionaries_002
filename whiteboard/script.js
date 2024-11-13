// Firebase database URL
const databaseURL = "https://whiteboard-5795a-default-rtdb.firebaseio.com";

const canvas = document.getElementById("whiteboard");
const ctx = canvas.getContext("2d");
canvas.width = 1100;
canvas.height = 800;

let isDrawing = false;
let mode = "None";  // Default mode
let color = "#000000"; // Default color
let brushSize = 2;  // Default brush size
let startX, startY; // Start coordinates for shapes

// Undo/Redo stacks
let undoStack = [];
let redoStack = [];

// Event listeners for mouse events on the canvas
canvas.addEventListener("mousedown", startInteraction);
canvas.addEventListener("mouseup", stopInteraction);
canvas.addEventListener("mousemove", interact);

// Starts drawing
function startInteraction(e) {
    isDrawing = true;
    startX = e.offsetX;
    startY = e.offsetY;

    if (mode === 'pen') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    }
}

// Stops drawing and saves the canvas state
function stopInteraction() {
    isDrawing = false;
    if (mode === 'pen') {
        ctx.closePath();
    } else if (mode === 'line' || mode === 'circle' || mode === 'rectangle' || mode === 'ellipse') {
        drawShape();
    } else if (mode === 'arrow') {
        drawArrow();
    }
    saveCanvasState();
}

// Handles drawing with the pen tool
function interact(e) {
    if (!isDrawing) return;

    if (mode === 'pen') {
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.strokeStyle = color;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
}

// Sets the drawing mode
function setMode(selectedMode) {
    mode = selectedMode;
}

// Sets the color for drawing
function setColor(newColor) {
    color = newColor;
}

// Sets the brush size
function setBrushSize(size) {
    brushSize = size;
}

// Clears the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoStack = [];
    redoStack = [];
}

// Saves the current canvas state for undo/redo
function saveCanvasState() {
    const canvasState = canvas.toDataURL();
    undoStack.push(canvasState);
    redoStack = [];
}

// Undo the last action
function undo() {
    if (undoStack.length > 1) {
        const lastState = undoStack.pop();
        redoStack.push(lastState);
        const previousState = undoStack[undoStack.length - 1];
        restoreCanvasState(previousState);
    }
}

// Redo the last undone action
function redo() {
    if (redoStack.length > 0) {
        const redoState = redoStack.pop();
        undoStack.push(redoState);
        restoreCanvasState(redoState);
    }
}

// Restores the canvas state from a saved data URL
function restoreCanvasState(state) {
    const img = new Image();
    img.src = state;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
}

// Draws an arrow
function drawArrow() {
    const endX = startX + (event.offsetX - startX);
    const endY = startY + (event.offsetY - startY);
    const arrowSize = 10;
    const angle = Math.atan2(endY - startY, endX - startX);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - arrowSize * Math.cos(angle - Math.PI / 6), endY - arrowSize * Math.sin(angle - Math.PI / 6));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - arrowSize * Math.cos(angle + Math.PI / 6), endY - arrowSize * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

// Draws a shape based on the selected mode
function drawShape() {
    const width = Math.abs(startX - event.offsetX);
    const height = Math.abs(startY - event.offsetY);

    switch (mode) {
        case 'line':
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(event.offsetX, event.offsetY);
            ctx.stroke();
            break;
        case 'circle':
            ctx.beginPath();
            ctx.arc(startX, startY, width, 0, 2 * Math.PI);
            ctx.stroke();
            break;
        case 'rectangle':
            ctx.beginPath();
            ctx.rect(startX, startY, width, height);
            ctx.stroke();
            break;
        case 'ellipse':
            ctx.beginPath();
            ctx.ellipse(startX, startY, width, height, 0, 0, 2 * Math.PI);
            ctx.stroke();
            break;
    }
}

// Saves the canvas and notes to Firebase
async function saveToFirebase() {
    const notes = document.getElementById("notes").value;
    const drawingData = canvas.toDataURL();
    const data = {
        drawing: drawingData,
        notes: notes,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(`${databaseURL}/whiteboard_data.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("Data saved successfully!");
            loadSavedFiles();
            loadSavedNotes();
        } else {
            console.error("Failed to save data:", response.statusText);
        }
    } catch (error) {
        console.error("Error saving to Firebase:", error);
    }
}

// Loads saved files from Firebase
async function loadSavedFiles() {
    const savedFilesContainer = document.getElementById("savedFiles");
    savedFilesContainer.innerHTML = "";

    try {
        const response = await fetch(`${databaseURL}/whiteboard_data.json`);
        const data = await response.json();

        for (const key in data) {
            const thumbnail = document.createElement("div");
            thumbnail.classList.add("file-thumbnail");
            const img = document.createElement("img");
            img.src = data[key].drawing;
            thumbnail.appendChild(img);
            savedFilesContainer.appendChild(thumbnail);
        }
    } catch (error) {
        console.error("Error loading saved files:", error);
    }
}

// Loads saved notes from Firebase
async function loadSavedNotes() {
    const savedNotesContainer = document.getElementById("savedNotes");
    savedNotesContainer.innerHTML = "";

    try {
        const response = await fetch(`${databaseURL}/whiteboard_data.json`);
        const data = await response.json();

        for (const key in data) {
            const note = document.createElement("div");
            note.classList.add("saved-note");
            note.textContent = data[key].notes;
            savedNotesContainer.appendChild(note);
        }
    } catch (error) {
        console.error("Error loading saved notes:", error);
    }
}

// Initializes the canvas and loads saved data on page load
window.onload = () => {
    saveCanvasState();
    loadSavedFiles();
    loadSavedNotes();
    document.getElementById("whiteboard").style.display = "block";
    document.getElementById("notes").style.display = "block";
};