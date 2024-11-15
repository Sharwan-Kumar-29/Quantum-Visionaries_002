
// Firebase database URL
const databaseURL = "https://whiteboard-5795a-default-rtdb.firebaseio.com";

// getting elements
const canvas = document.getElementById("whiteboard");
const ctx = canvas.getContext("2d");
const notes = document.getElementById("notes");
const toolbar = document.getElementById("toolbar");
const savedFilesContainer = document.getElementById("savedFiles");

canvas.width = 1100;
canvas.height = 800;
notes.style.display = "none";
let isDrawing = false;
let mode = "None";  // Default mode
let color = "#000000"; // Default color
let brushSize = 2;  // Default brush size
let isTextMode = false;
let backgroundColor = "#ffffff";
let startX, startY; // Start coordinates for shapes
let textAreaElements = []; // Track text areas for moving and resizing
let images = [];  // Array to store image data

let isResizing = false; // Flag to check if resizing is happening
let isDragging = false; // Flag to check if dragging is happening
let activeImageIndex = -1; // Index of the image being resized or dragged
// Undo/Redo stacks
let undoStack = [];
let redoStack = [];

// Event listeners for mouse events on the canvas
canvas.addEventListener("mousedown", startInteraction);
canvas.addEventListener("mouseup", stopInteraction);
canvas.addEventListener("mousemove", interact);
canvas.addEventListener("click", addTextOnCanvas);
canvas.addEventListener("mousedown", startResizingOrDragging);
canvas.addEventListener("mousemove", resizeOrDragImage);
canvas.addEventListener("mouseup", stopResizingOrDragging);


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
        ctx.strokeStyle = mode === "eraser" ? "#ffffff" : color;  // Use white if erasing
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
}

function setMode(selectedMode) {
    mode = selectedMode;
    isTextMode = mode === "text";
    if (mode === "eraser") {
        color = "#ffffff";  // Change to white for eraser
        ctx.lineWidth = brushSize;  // Ensure brush size is applied for eraser
    }
}

// Sets the color for drawing
function setColor(newColor) {
    color = newColor;
}

// Sets the brush size
function setBrushSize(size) {
    brushSize = size;

    if (mode === "eraser") {
        ctx.lineWidth = brushSize;  // Ensure the brush size is set when erasing
    }
}

function clearCanvas() {
    // Clear only the canvas area where drawings are made
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Fill with the background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    undoStack = [];
    redoStack = [];
    // Redraw all images
    images.forEach(img => {
        ctx.drawImage(img.image, img.x, img.y, img.width, img.height);
    });
}


function addTextOnCanvas(e) {
    if (isTextMode) {
        const x = e.offsetX;
        const y = e.offsetY;
        addTextArea(x, y);
    }
}

function addTextArea(x, y) {
    const textArea = document.createElement("textarea");
    textArea.style.left = `${canvas.offsetLeft + x}px`;
    textArea.style.top = `${canvas.offsetTop + y}px`;

    // Styling the text area to resemble the desired look
    textArea.style.font = "16px Arial";
    textArea.style.color = color;
    textArea.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
    textArea.style.border = "1px solid #ccc";

    // Add resize handle to the text area
    const resizeHandle = document.createElement("div");
    resizeHandle.classList.add("resize-handle");
    textArea.appendChild(resizeHandle);

    document.body.appendChild(textArea);
    textArea.focus();

    // Automatically resize the text area based on content
    textArea.addEventListener("input", () => autoResize(textArea));

    // Save the text to canvas when user finishes typing
    textArea.addEventListener("blur", () => saveTextToCanvas(textArea, x, y));
    textArea.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            saveTextToCanvas(textArea, x, y);
        }
    });

    // Make text area draggable
    makeDraggable(textArea);

    // Make the text area resizable
    makeResizable(textArea, resizeHandle);
    textAreaElements.push(textArea); // Track the created text area
}

function autoResize(textArea) {
    // Reset height before measuring the new content
    textArea.style.height = 'auto';
    textArea.style.height = textArea.scrollHeight + 'px';
}

function saveTextToCanvas(textArea, x, y) {
    ctx.font = "16px Arial";
    ctx.fillStyle = color;

    // Get the text content, preserve line breaks
    const text = textArea.value;
    const lines = text.split('\n');
    const lineHeight = 20;
    lines.forEach((line, index) => {
        ctx.fillText(line, x, y + (lineHeight * index));
    });
    textArea.remove();
}

// Function to upload image
function uploadImage(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const imgData = {
                    image: img,
                    x: 50,
                    y: 50,
                    width: 100,
                    height: 100
                };
                images.push(imgData); // Add the new image to the array
                drawImages(); // Draw all images (including the new one) on the canvas
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        alert("Please upload a valid image file.");
    }
}

// Function to draw all images on the canvas
function drawImages() {
    // Assuming 'ctx' is the canvas context
    images.forEach((imgData) => {
        ctx.drawImage(imgData.image, imgData.x, imgData.y, imgData.width, imgData.height);
    });
}


function setBackgroundColor() {
    const newColor = prompt("Enter a hex color code or choose from color picker:", "#ffffff");
    if (newColor) {
        backgroundColor = newColor;
        canvas.style.backgroundColor = backgroundColor;
        clearCanvas();
    }
}

function toggleDownloadOptions() {
    const downloadOptions = document.getElementById("downloadOptions");
    downloadOptions.style.display = downloadOptions.style.display === 'none' ? 'block' : 'none';
}

function downloadCanvas(format) {
    const canvas = document.getElementById("whiteboard");
    const link = document.createElement('a');
    let dataUrl;
    
    if (format === 'png') {
        dataUrl = canvas.toDataURL('image/png');
    } else if (format === 'jpg') {
        dataUrl = canvas.toDataURL('image/jpeg');
    }

    link.href = dataUrl;
    link.download = `whiteboard.${format}`;
    link.click();
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const canvas = document.getElementById("whiteboard");
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 10, 10, 180, 160);
    doc.save('whiteboard.pdf');
}
// Make text area draggable
function makeDraggable(element) {
    let offsetX, offsetY, isDragging = false;

    element.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            element.style.left = `${e.clientX - offsetX}px`;
            element.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });
}

// Make text area resizable
function makeResizable(textArea, resizeHandle) {
    let isResizing = false;

    resizeHandle.addEventListener("mousedown", (e) => {
        isResizing = true;
        e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
        if (isResizing) {
            const width = e.clientX - textArea.offsetLeft;
            const height = e.clientY - textArea.offsetTop;
            textArea.style.width = `${width}px`;
            textArea.style.height = `${height}px`;
            autoResize(textArea); // Ensure auto-resize behavior
        }
    });

    document.addEventListener("mouseup", () => {
        isResizing = false;
    });
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

// // Loads saved files from Firebase
// async function loadSavedFiles() {
//     const savedFilesContainer = document.getElementById("savedFiles");
//     savedFilesContainer.innerHTML = "<h3>Saved Files</h3>";  // Reset saved files list

//     try {
//         const response = await fetch(`${databaseURL}/whiteboard_data.json`);

//         if (!response.ok) {
//             throw new Error("Failed to fetch data");
//         }

//         const data = await response.json();

//         if (data) {
//             Object.keys(data).forEach(key => {
//                 const entry = data[key];  // Get each saved entry (drawing, notes, notesColor)

//                 const img = new Image();
//                 img.src = entry.drawing;  // Set image source from saved drawing
//                 img.onload = () => {
//                     const fileThumbnail = document.createElement("div");
//                     fileThumbnail.classList.add("file-thumbnail");
//                     fileThumbnail.onclick = () => loadFile(entry.drawing, entry.notes, entry.notesColor);  // Set click event to load file

//                     const thumbnailImg = document.createElement("img");
//                     thumbnailImg.src = entry.drawing;  // Display thumbnail image
//                     fileThumbnail.appendChild(thumbnailImg);

//                     savedFilesContainer.appendChild(fileThumbnail);  // Add thumbnail to the page
//                 };
//             });
//         }
//     } catch (error) {
//         console.error("Error loading saved files:", error);
//     }
// }

// function loadFile(drawingData, notes, backgroundColor, images) {
//     const img = new Image();
//     img.onload = () => {
//         clearCanvas();
//         ctx.drawImage(img, 0, 0); // Redraw the saved image
//     };
//     img.src = drawingData;

//     // Reload the saved notes
//     document.getElementById("notes").value = notes;
//     document.getElementById("notes").style.color = "black";  // Set notes color if necessary

//     // Apply saved background color
//     canvas.style.backgroundColor = backgroundColor;

//     // Load and draw images
//     images.forEach((imgData) => {
//         ctx.drawImage(imgData.image, imgData.x, imgData.y, imgData.width, imgData.height);
//     });
// }

//Initializes the canvas and loads saved data on page load
window.onload = () => {
    saveCanvasState();
    // loadSavedFiles();

    document.getElementById("whiteboard").style.display = "block";
};