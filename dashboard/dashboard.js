// Firebase Database URL
// const databaseURL = "https://whiteboard-5795a-default-rtdb.firebaseio.com";

const databaseURL ="https://quantum-visionaries-002-default-rtdb.firebaseio.com";
// Show and hide side navbar for small screens
function displaySideNavbar() {
    document.getElementById("side-nav").style.display = "block";
}

function hideSideNavbar() {
    document.getElementById("side-nav").style.display = "none";
}

// Hide side navbar for larger screen sizes
window.addEventListener("resize", () => {
    if (window.innerWidth > 480) {
        document.getElementById("side-nav").style.display = "none";
    }
});

// New blank whiteboard
document.getElementById("blank-whiteboard").addEventListener("click", () => {
    document.querySelector("main").classList.add("blur", "no-pointer-events");
    document.getElementById("create-new-whiteboard").style.display = "block";
});

// Cancel creating a new whiteboard
document.getElementById("cancel-new-wb").addEventListener("click", () => {
    document.getElementById("create-new-whiteboard").style.display = "none";
    document.querySelector("main").classList.remove("blur", "no-pointer-events");
});

// Create a new whiteboard
document.getElementById("create-new-wb").addEventListener("click", () => {
    const nameInput = document.getElementById("whiteboard-name");
    const newWhiteboard = nameInput.value.trim();
    if (newWhiteboard) {
        nameInput.value = "";
        redirectToNewWhiteBoard(newWhiteboard);
    } else {
        alert("Please enter a valid project name.");
    }
});

// Redirect to new whiteboard
function redirectToNewWhiteBoard(whiteboardName) {
    window.location.href = `./../whiteboard/home.html?k=${whiteboardName}`;
}

// Change theme
document.getElementById("theme-image").addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    const themeImg = document.getElementById("theme-image");
    const hamburger = document.getElementById("hamburger-menu-icon");
    if (document.body.classList.contains("dark-theme")) {
        themeImg.src = "./../src/Assets/images/light-mode.png";
        hamburger.src = "./../src/Assets/images/hamburger-white-menu.png";
    } else {
        themeImg.src = "./../src/Assets/images/dark-mode.png";
        hamburger.src = "./../src/Assets/images/hamburger-menu.png";
    }
});

// Log out user
function logOut() {
    localStorage.removeItem("authToken");
    window.location.href = "./../index.html";
}

// Load saved files from Firebase and display project name
async function loadSavedFiles() {
    const recentWhiteboardsContainer = document.getElementById("recent-whiteboards");
    recentWhiteboardsContainer.innerHTML = ""; // Clear previous entries

    try {
        const response = await fetch(`${databaseURL}/whiteboard_data.json`);
        if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);

        const data = await response.json();
        if (data) {
            Object.keys(data).forEach((key) => {
                const entry = data[key]; // Each whiteboard entry

                const fileThumbnail = document.createElement("div");
                fileThumbnail.classList.add("file-thumbnail");

                // Create a container for both image and project name
                const thumbnailContainer = document.createElement("div");
                thumbnailContainer.classList.add("thumbnail-container");

                const thumbnailImg = document.createElement("img");
                thumbnailImg.src = entry.drawing; // Display thumbnail image
                thumbnailImg.alt = "Whiteboard Thumbnail";

                // Add the project name below the thumbnail image
                const projectName = document.createElement("p");
                projectName.classList.add("project-name");
                projectName.textContent = entry.projectName || "Untitled Project"; // Display project name (or default text)

                thumbnailContainer.appendChild(thumbnailImg);
                thumbnailContainer.appendChild(projectName);
                fileThumbnail.appendChild(thumbnailContainer);

                // When the thumbnail is clicked, redirect to the home page and load the specific file
                fileThumbnail.onclick = () => {
                    window.location.href = `./../whiteboard/home.html?key=${key}`;
                };

                recentWhiteboardsContainer.appendChild(fileThumbnail);
            });
        }
    } catch (error) {
        console.error("Error loading saved files:", error);
    }
}



// Load a file into the whiteboard
function loadFile(drawingData, notes, backgroundColor, images) {
    // Assuming a canvas setup with `ctx` (canvas context)
    const img = new Image();
    img.onload = () => {
        clearCanvas();
        ctx.drawImage(img, 0, 0); // Redraw saved image
    };
    img.src = drawingData;

    document.getElementById("notes").value = notes || "";
    canvas.style.backgroundColor = backgroundColor || "#ffffff";

    images.forEach(({ image, x, y, width, height }) => {
        const imgElem = new Image();
        imgElem.onload = () => ctx.drawImage(imgElem, x, y, width, height);
        imgElem.src = image;
    });
}

// Clear canvas utility
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Load saved files on page load
document.addEventListener("DOMContentLoaded", loadSavedFiles);
