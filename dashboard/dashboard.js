import { getUserId } from "../src/validateToken.js"

// stores the whiteboards saved by user in firebase 
let whiteboards;
let userId;

// get user id from google authentication api request 
async function getUserData() {
    const token = localStorage.getItem("authToken")
    if (token) {
        const res = await getUserId(token)
        if (res.status) {
            userId = res.userId;
            fetchWhiteboards(userId)
            fetchUserData(userId)
        }
        else {
            console.error("Invalid session login again")
            window.location.href = "./../signIn/singIn.html"
        }
    } else {
        window.location.href = "./../signIn/singIn.html"
    }
}
// get user data and fetch whiteboards
getUserData()


// fetch whiteboards stored in firebase for specific user 
async function fetchWhiteboards(userId) {

    const URL = `https://quantum-visionaries-002-default-rtdb.firebaseio.com/users/${userId}/whiteboards.json`

    try {
        let resp = await fetch(URL)
        if (resp.ok) {
            let res = await resp.json()
            // if user saved some whiteboards
            if (res) {
                whiteboards = res
                // sort and display the sorted whiteboards
                sortRecentWhiteboards()
            }
            // if user do not save any whiteboards
            else {
                displayRecentWhiteboards(null)
            }
        }
        else {
            let err = await resp.json()
            console.error("error in parsing response", err.error.message)
        }
    }
    catch (err) {
        console.error("Error fetching whiteboards", err)
    }
}



// show recent whiteboards after whiteboards fetched
function displayRecentWhiteboards(whiteboards) {

    let recentWhiteboards = document.getElementById("recent-whiteboards")
    recentWhiteboards.innerHTML = ""

    if (whiteboards) {
        document.getElementById("no-whiteboards-message").style.display = "none"
        document.getElementById("search-whiteboards").style.display = "block";
        document.getElementById("sort-whiteboards").style.display = "block";
        // iterate through each whiteboards
        for (let whiteboard in whiteboards) {

            // get the date of whiteboard stored
            let date = new Date(whiteboards[whiteboard].timestamp)
            // change date to canadian format 2024/11/15
            date = date.toLocaleDateString('en-CA')

            // create new div for each stored whiteboard
            let newDiv = document.createElement("div")
            // add the whiteboard
            let imgDiv = document.createElement("div")
            imgDiv.innerHTML = `<img src="${whiteboards[whiteboard].drawing}"></img>`



            let details = document.createElement("div")
            details.innerHTML = `
            <p>${whiteboard}</p>
            `
            let deleteIconDiv = document.createElement("div")
            deleteIconDiv.classList.add("delete-icon")

            deleteIconDiv.innerHTML = `<img src="./../src/Assets/images/trash.png">`

            newDiv.append(imgDiv, details, deleteIconDiv)
            newDiv.classList.add("recent-whiteboards-cards")

            deleteIconDiv.addEventListener("click", (event) => {
                event.stopPropagation()
                const value = confirm(`Do you want to delete the whiteboard, this is permanent and can't be undone`)
                if (value) {
                    deleteWhiteboard(whiteboard);
                }
            })
            // append data on web page 
            recentWhiteboards.append(newDiv)
            newDiv.addEventListener('click', () => {
                window.location.href = `./../whiteboard/home.html?u=${userId}&ep=${whiteboard}`
            })

            newDiv.addEventListener("mouseenter", () => {
                deleteIconDiv.style.display = "block"
            })
            newDiv.addEventListener("mouseleave", () => {
                deleteIconDiv.style.display = "none"
            })

        }
    }
    else {
        document.getElementById("search-whiteboards").style.display = "none";
        document.getElementById("sort-whiteboards").style.display = "none";
        document.getElementById("no-whiteboards-message").style.display = "block"
    }
}


// delete whiteboard 
async function deleteWhiteboard(whiteboard) {
    whiteboards = Object.keys(whiteboards).filter(key => key !== whiteboard).reduce((acc, key) => {
        acc[key] = whiteboards[key];
        return acc;
    }, {})

    // deleteWhiteboard from firebase 
    const URL = `https://quantum-visionaries-002-default-rtdb.firebaseio.com/users/${userId}/whiteboards/${whiteboard}.json`

    const requestOptions = {
        method: "DELETE",
        redirect: "follow"
    }

    try {
        let resp = await fetch(URL, requestOptions)
        if (resp.ok) {
            displayRecentWhiteboards(whiteboards)
        }
        else {
            let err = await resp.json()
            alert(err.error.message)
        }
    }
    catch (err) {
        console.log(err)
        alert(err.error.message)
    }

}

// fetch and append user data 
async function fetchUserData(userId) {
    const URL = `https://quantum-visionaries-002-default-rtdb.firebaseio.com/users/${userId}.json`
    try {
        let resp = await fetch(URL)
        if (resp.ok) {
            let data = await resp.json()
            appendUserDate(data)
        }
        else {
            let err = await resp.json()
            console.log(err.error.message)
        }
    }
    catch (err) {
        console.log(err)
        alert(err.error.message)
    }

}

function appendUserDate(data) {
    let profileDiv = document.getElementById("user-details")

    profileDiv.innerHTML = `
    <p>${data.username}</p>
    <p>${data.email}</p>
    `
    let logoutbtn = document.createElement("div")
    logoutbtn.textContent = "Logout"

    profileDiv.appendChild(logoutbtn)

    logoutbtn.addEventListener("click", logout)

}




document.getElementById("hamburger-menu").addEventListener("click", displaySideNavbar)
// side navbar for small width screen  
function displaySideNavbar() {
    let sideNav = document.getElementById("side-nav")
    sideNav.style.display = "block";
}
function hideSideNavbar() {
    let sideNav = document.getElementById("side-nav")
    sideNav.style.display = "none";
}

// hide side navbar for mid and large screen size 
window.addEventListener("resize", () => {
    let width = window.innerWidth;
    if (width > 480) {
        hideSideNavbar()
    }
})


// close side navbar 
document.getElementById("close-side-bar").addEventListener("click", () => {
    document.getElementById("side-nav").style.display = "none"
})

// log out the user 
function logout() {
    localStorage.removeItem("authToken")
    window.location.href = `./../index.html`
}
// logout from side navbar
document.getElementById("logout").addEventListener("click", logout)




// create new blank whiteboard 
const blankWhiteboard = document.getElementById("blank-whiteboard")

blankWhiteboard.addEventListener("click", () => {
    // blur the background except navigation 
    let main = document.querySelector("main")
    main.classList.add("blur", "no-pointer-events")
    let whiteboardDetails = document.getElementById("create-new-whiteboard")

    whiteboardDetails.style.display = "block";
})
// cancel creating new blank whiteboard
document.getElementById("cancel-new-wb").addEventListener("click", () => {
    document.getElementById("create-new-whiteboard").style.display = "none";
    document.querySelector("main").classList.remove("blur", "no-pointer-events")
    document.getElementById("whiteboard-name").value = ""
})


// validate the name and go for new whiteboard
document.getElementById("create-new-wb").addEventListener("click", validateWhiteboardName)

function validateWhiteboardName() {
    let nameInput = document.getElementById("whiteboard-name")

    const newWhiteboard = nameInput.value.trim()

    if (newWhiteboard.length < 1) {
        let nameMessage = document.getElementById("project-name-invalid-message")
        nameMessage.style.display = "block"

        nameInput.oninput = function () {
            nameMessage.style.display = "none"
        }
    }
    else {
        // check if whiteboard name already used 
        if (whiteboards) {
            for (let whiteboard in whiteboards) {
                if (whiteboard === newWhiteboard) {
                    let nameMessage = document.getElementById("project-name-taken-message")
                    nameMessage.style.display = "block"

                    nameInput.oninput = function () {
                        nameMessage.style.display = "none"
                    }
                    return
                }
            }
        }
        nameInput.value = ""
        redirectToNewWhiteBoard(newWhiteboard)
    }
}

// redirect user to blank whiteboard
function redirectToNewWhiteBoard(whiteboardName) {
    window.location.href = `./../whiteboard/home.html?u=${userId}&p=${whiteboardName}`
}



// display profile
function displayProfile() {
    let profileDiv = document.getElementById("user-profile")
    if (profileDiv.style.display === "none") {
        profileDiv.style.display = "block"
    }
    else {
        profileDiv.style.display = "none"
    }
}

document.getElementById("profile-icon").addEventListener("click", displayProfile)

// change theme
let theme = document.getElementById("theme-image")
theme.onclick = function () {
    document.body.classList.toggle("dark-theme")

    let hamburger = document.getElementById("hamburger-menu-icon")
    if (document.body.classList.contains("dark-theme")) {
        // change theme-change icon 
        theme.setAttribute("src", "./../src/Assets/images/light-mode.png")

        // change hamburger icon 
        hamburger.src = "./../src/Assets/images/hamburger-white-menu.png"
    }
    else {
        // change theme-change icon 
        theme.setAttribute("src", "./../src/Assets/images/dark-mode.png")

        // change hamburger icon 
        hamburger.src = "./../src/Assets/images/hamburger-menu.png"

    }
}




// redirect the user 
function redirectTologin() {
    window.location.href = `./../signIn/signIn.html`
}

// debounce search
const debounce = function () {
    let timeout;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(() => searchRecentWhiteboards(whiteboards), 500);
    };
}

// searching functionality for recent whiteboards 
const searchRecentWhiteboards = function (whiteboardContainer) {
    // if any designs are saved 
    let searchedText = searchInput.value
    if (whiteboardContainer) {
        const container = {}
        for (let whiteboard in whiteboardContainer) {
            if (whiteboard.includes(searchedText))
                container[whiteboard] = whiteboardContainer[whiteboard]
        }
        displayRecentWhiteboards(container)
    }
    else {
        return
    }
}

// search input
let searchInput = document.getElementById("search-whiteboards")
// search input for searching saved whiteboards
searchInput.addEventListener("input", debounce())




// // sorting the whiteboards based on name and data created
let sortWhiteboards = document.getElementById("sort-whiteboards")
sortWhiteboards.addEventListener("change", sortRecentWhiteboards)

// Sort recent whiteboards
function sortRecentWhiteboards() {
    const sortBy = sortWhiteboards.value;
    let copyWhiteboard = { ...whiteboards }

    if (sortBy === "name-asc") {
        copyWhiteboard = Object.keys(copyWhiteboard).sort().reduce((obj, key) => {
            obj[key] = copyWhiteboard[key];
            return obj;
        }, {});
    } else if (sortBy === "name-desc") {
        // Sort by name in descending order
        copyWhiteboard = Object.keys(copyWhiteboard).sort().reverse().reduce((obj, key) => {
            obj[key] = copyWhiteboard[key];
            return obj;
        }, {});
    } else if (sortBy === "date-asc") {
        // Sort by date created in ascending order
        copyWhiteboard = Object.keys(copyWhiteboard).sort((a, b) => new Date(copyWhiteboard[a].timestamp) - new Date(copyWhiteboard[b].timestamp)).reduce((obj, key) => {
            obj[key] = copyWhiteboard[key];
            return obj;
        }, {});
    } else if (sortBy === "date-desc") {
        // Sort by date created in descending order
        copyWhiteboard = Object.keys(copyWhiteboard).sort((a, b) => new Date(copyWhiteboard[b].timestamp) - new Date(copyWhiteboard[a].timestamp))
            .reduce((obj, key) => {
                obj[key] = copyWhiteboard[key];
                return obj;
            }, {});
    }
    if (searchInput.value === "") {
        // Display the sorted whiteboards
        displayRecentWhiteboards(copyWhiteboard);
    }
    else {
        // first search and then display 
        searchRecentWhiteboards(copyWhiteboard)
    }
}
