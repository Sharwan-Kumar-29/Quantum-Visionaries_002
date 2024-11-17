
// Firebase database URL
// const databaseURL = "https://whiteboard-5795a-default-rtdb.firebaseio.com";
const databaseURL = "https://quantum-visionaries-002-default-rtdb.firebaseio.com";

// getting elements
const canvas = document.getElementById("whiteboard");
const ctx = canvas.getContext("2d");
const notes = document.getElementById("notes");
const toolbar = document.getElementById("toolbar");
//canvas width and height
canvas.width = 1100;
canvas.height = 800;

notes.style.display = "none";
let isDrawing = false;
let mode = "pen";  // Default mode
let color = "#000000"; // Default color
let brushSize = 2;  // Default brush size
let isTextMode = false;
let backgroundColor = "#ffffff";
let startX, startY; // Start coordinates for shapes
let textAreaElements = []; // Track text areas for moving and resizing
let images = [];  // Array to store image data
let imgX = 0, imgY = 0, imgWidth = 150, imgHeight = 150; // Initial position and size of the image
let drawingData = []; // Store the drawing data (paths)

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

// Starts drawing
function startInteraction(e) {
    const { offsetX, offsetY } = e;
    isDrawing = true;
    startX = offsetX;
    startY = offsetY;

    // Initialize drawing paths or handle mode-specific actions
    if (mode === 'pen' || mode === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        if (mode === 'pen') {
            drawingData.push({ path: [{ x: offsetX, y: offsetY }], color: color, size: brushSize });
        }
    } else if (mode === 'line' || mode === 'rectangle' || mode === 'circle' || mode === 'ellipse') {
        // Start drawing a shape
        ctx.beginPath();
    } else if (imgX && offsetX >= imgX && offsetX <= imgX + imgWidth && offsetY >= imgY && offsetY <= imgY + imgHeight) {
        // Handle image interaction (dragging or resizing)
        if (offsetX >= imgX + imgWidth - 10 && offsetY >= imgY + imgHeight - 10) {
            isResizing = true;
        } else {
            isDragging = true;
        }
    }
}


// Stops drawing and saves the canvas state
function stopInteraction() {
    isDrawing = false;

    if (mode === 'pen' || mode === 'eraser') {
        ctx.closePath();
    } else if (mode === 'line' || mode === 'circle' || mode === 'rectangle' || mode === 'ellipse' || mode === 'diamond' || mode === 'parallelogram' || mode === 'triangle') {
        drawShape();
    } else if (mode === 'arrow') {
        drawArrow();
    }

    saveCanvasState(); // Save the state after the interaction
}

// Handles drawing with the pen tool
function interact(e) {
    if (!isDrawing) return;

    const { offsetX, offsetY } = e;

    if (mode === 'pen') {
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.strokeStyle = color;
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();

        // Save drawing path for pen tool
        drawingData[drawingData.length - 1].path.push({ x: offsetX, y: offsetY });
    } else if (mode === 'eraser') {
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#ffffff"; // Erase with white color
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    } else if (isDragging) {
        // Move the image
        const deltaX = offsetX - startX;
        const deltaY = offsetY - startY;
        imgX += deltaX;
        imgY += deltaY;
        startX = offsetX;
        startY = offsetY;
        redrawCanvas();
    } else if (isResizing) {
        // Resize the image
        imgWidth = offsetX - imgX;
        imgHeight = offsetY - imgY;
        redrawCanvas();
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

// Function to toggle the visibility of the slider
function toggleSlider() {
    const slider = document.getElementById('brushSizeSlider');
    if (slider.style.display === 'none') {
        slider.style.display = 'block';
    } else {
        slider.style.display = 'none';
    }
}
// Sets the brush size
function setBrushSize(size) {
    brushSize = size;
    console.log(size);

    if (mode === "eraser") {
        ctx.lineWidth = brushSize;  // Ensure the brush size is set when erasing
    }
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
        case 'diamond':
            ctx.setLineDash([]); // Solid
            ctx.moveTo(startX, startY - height / 2); // Top vertex
            ctx.lineTo(startX + width / 2, startY); // Right vertex
            ctx.lineTo(startX, startY + height / 2); // Bottom vertex
            ctx.lineTo(startX - width / 2, startY); // Left vertex
            ctx.closePath();
            ctx.stroke();
            break;

        case 'parallelogram':
            ctx.setLineDash([]); // Solid
            const offset = width / 4; // Slant factor
            ctx.moveTo(startX + offset, startY);
            ctx.lineTo(startX + width, startY);
            ctx.lineTo(startX + width - offset, startY + height);
            ctx.lineTo(startX, startY + height);
            ctx.closePath();
            ctx.stroke();
            break;
        case 'triangle':
            ctx.setLineDash([]); // Solid
            // Calculate the vertices of the triangle
            const baseX = startX;
            const baseY = startY + height; // Bottom vertex
            const leftX = startX - width / 2;
            const leftY = startY; // Left vertex
            const rightX = startX + width / 2;
            const rightY = startY; // Right vertex

            ctx.moveTo(baseX, baseY);  // Move to bottom vertex
            ctx.lineTo(leftX, leftY); // Draw line to left vertex
            ctx.lineTo(rightX, rightY); // Draw line to right vertex
            ctx.closePath(); // Close the triangle
            ctx.stroke();
    }
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


// text area on canvas code for text area setting
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
    textArea.style.font = "25px Arial";
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
    textArea.addEventListener("blur", () => saveTextToCanvas(textArea, x, y)); // Save on blur

    // Save text when clicking anywhere outside the text area
    document.addEventListener("mousedown", (e) => {
        if (!textArea.contains(e.target)) { // If click target is not the text area
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


function saveTextToCanvas(textArea, x, y) {
    ctx.font = "25px Arial";
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

function clearCanvas() {
    // Clear only the canvas area where drawings are made
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Fill with the background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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

// Restores the canvas state from a saved data URL
function restoreCanvasState(state) {
    const img = new Image();
    img.src = state;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
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

// Redraw the canvas and draw the paths and image
function redrawCanvas() {
    clearCanvas();

    // Draw the image if it exists
    if (img) {
        ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
    }

    // Redraw all saved paths
    drawingData.forEach(drawing => {
        ctx.beginPath();
        ctx.lineWidth = drawing.size;
        ctx.strokeStyle = drawing.color;
        ctx.moveTo(drawing.path[0].x, drawing.path[0].y);
        drawing.path.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.stroke();
    });
}



console.log(userId, whiteboardId)
// Saves the canvas and notes to Firebase
async function saveToFirebase() {

    const URL = window.location.search
    const params = new URLSearchParams(URL)
    const userId = params.get("u")
    const whiteboardId = params.get("p") || params.get("ep")
    const notes = document.getElementById("notes").value;
    const drawingData = canvas.toDataURL();
    const data = {
        drawing: drawingData,
        notes: notes,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(`${databaseURL}/users/${userId}/whiteboards/${whiteboardId}.json`, {
            method: "PUT",
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

//add images to whiteboard
// Global variables for image manipulation
let selectedImage = null;
let isMouseDown = false;
let offsetX, offsetY;

// Load the image from local file manager
function loadImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        const imageProps = {
            img: img,
            x: 50, // Initial X position
            y: 50, // Initial Y position
            width: img.width / 4, // Initial width (scaled down)
            height: img.height / 4, // Initial height (scaled down)
            isDragging: false,
            isResizing: false,
        };
        images.push(imageProps);
        drawCanvas(); // Redraw the canvas to include the new image
    };
    img.src = URL.createObjectURL(file); // Create a temporary object URL for the image
}

// Draw the canvas with all images
function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    images.forEach((image) => {
        ctx.drawImage(image.img, image.x, image.y, image.width, image.height);
    });
    drawResizeHandles(); // Draw resize handles
}

// Mouse down event
whiteboard.addEventListener('mousedown', (event) => {
    const { offsetX: x, offsetY: y } = event;
    isMouseDown = true;
    selectedImage = null;

    // Check if the mouse is over an image
    images.forEach((image) => {
        if (
            x >= image.x &&
            x <= image.x + image.width &&
            y >= image.y &&
            y <= image.y + image.height
        ) {
            selectedImage = image;
            offsetX = x - image.x;
            offsetY = y - image.y;

            // Check if resizing (near bottom-right corner)
            if (
                x >= image.x + image.width - 10 &&
                y >= image.y + image.height - 10
            ) {
                selectedImage.isResizing = true;
            } else {
                selectedImage.isDragging = true;
            }
        }
    });
});

// Mouse move event
whiteboard.addEventListener('mousemove', (event) => {
    if (!isMouseDown || !selectedImage) return;

    const { offsetX: x, offsetY: y } = event;

    if (selectedImage.isDragging) {
        // Move the image
        selectedImage.x = x - offsetX;
        selectedImage.y = y - offsetY;
    } else if (selectedImage.isResizing) {
        // Resize the image
        selectedImage.width = x - selectedImage.x;
        selectedImage.height = y - selectedImage.y;
    }

    drawCanvas(); // Redraw the canvas
});

// Mouse up event
whiteboard.addEventListener('mouseup', () => {
    isMouseDown = false;
    if (selectedImage) {
        selectedImage.isDragging = false;
        selectedImage.isResizing = false;
    }
    selectedImage = null;
});

// Optional: Draw resize handles on images
function drawResizeHandles() {
    images.forEach((image) => {
        ctx.fillStyle = 'blue';
        ctx.fillRect(
            image.x + image.width - 10,
            image.y + image.height - 10,
            10,
            10
        );
    });
}

// Function to toggle the visibility of the dropdown
function toggleColorDropdown() {
    const dropdown = document.getElementById("colorDropdown");
    // Toggle visibility of the dropdown
    dropdown.style.display = (dropdown.style.display === "none" || dropdown.style.display === "") ? "block" : "none";
}

// Function to set the background color
// Function to toggle the visibility of the color options below the background button
function toggleColorOptions(event) {
    const colorOptions = document.getElementById("colorOptions");

    // Show or hide the color options
    colorOptions.style.display = (colorOptions.style.display === "none" || colorOptions.style.display === "") ? "block" : "none";

    // Position the color options directly below the button
    if (colorOptions.style.display === "block") {
        const button = document.getElementById("backgroundButton");
        const rect = button.getBoundingClientRect();
        colorOptions.style.left = `${rect.left}px`;
        colorOptions.style.top = `${rect.bottom + window.scrollY}px`;
    }

    // Prevent the event from propagating so it doesn't trigger the document click listener
    event.stopPropagation();
}

// Function to set the background color when an option is selected
function setBackgroundColor(color) {
    backgroundColor = color;
    canvas.style.backgroundColor = backgroundColor;
    clearCanvas();

    // Hide the color options after selection
    document.getElementById("colorOptions").style.display = "none";
}

// Function to close the color options when clicking outside
document.addEventListener('click', function (event) {
    const colorOptions = document.getElementById("colorOptions");
    const button = document.getElementById("backgroundButton");

    // If the click is outside the color options or button, hide the color options
    if (!colorOptions.contains(event.target) && event.target !== button) {
        colorOptions.style.display = "none";
    }
});


// download file code
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

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById("themeIcon");

    // Toggle the night mode class on the body
    body.classList.toggle("night-mode");

    // Update the icon based on the theme
    if (body.classList.contains("night-mode")) {
        themeIcon.classList.remove("fa-sun");
        themeIcon.classList.add("fa-moon");
    } else {
        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun");
    }
}

//Initializes the canvas and loads saved data on page load
window.onload = () => {
    saveCanvasState();
    // loadSavedFiles();

    document.getElementById("whiteboard").style.display = "block";
};

// load data of previous white board

