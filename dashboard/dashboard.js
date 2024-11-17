import { getUserId } from "../src/validateToken.js"


// stores the whiteboards saved by user in firebase 
let whiteboards = []
let userId;

// get user id from google authentication api request 
async function getUserData() {
    const token = localStorage.getItem("authToken")
    const res = await getUserId(token)
    if (res.value) {
        userId = res.value;
        console.log(res.value)
        fetchWhiteboards(res.value)
    }
    else {
        console.error("Invalid session login again")
    }

}
// get user data and fetch whiteboards
getUserData()


// fetch whiteboards stored in firebase for specific user 
async function fetchWhiteboards(userId) {
    const API_KEY = "AIzaSyD4sqsxSpMI58pH2DimueULkR_PCVWEUdY"
    const URL = `https://user-authentication-ebb7d-default-rtdb.firebaseio.com/users/${userId}/whiteboards.json`

    try {
        let resp = await fetch(URL)
        if (resp.ok) {
            let res = await resp.json()
            // if user saved some whiteboards
            if (res) {
                console.log("fetched whiteboard", res)
                whiteboards = res
                displayRecentWhiteboards(whiteboards)
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
    console.log(whiteboards)
    if (whiteboards) {
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
            <p>${whiteboard}</p>`

            newDiv.append(imgDiv, details)
            newDiv.classList.add("recent-whiteboards")
            // append data on web page 
            recentWhiteboards.appendChild(newDiv)
            newDiv.addEventListener('click', () => {
                window.location.href = `./../whiteboard/home.html?u=${userId}&ep=${whiteboard}`
            })
        }
    }
    else {
        // console.log(whiteboards)
    }
}





// side navbar for small width screen  
function displaySideNavbar() {
    console.log("clicked")
    let sideNav = document.getElementById("side-nav")

    sideNav.style.display = "block";
}
function hideSideNavbar() {
    let sideNav = document.getElementById("side-nav")
    sideNav.style.display = "none";
}

// hide side navbar for mid and large screen size 
window.addEventListener("resize", () => {
    const sideNav = document.getElementById("side-nav")

    let width = window.innerWidth;
    if (width > 480) {
        sideNav.style.display = "none"
    }
})



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
})


// validate the name and go for new whiteboard
document.getElementById("create-new-wb").addEventListener("click", validateWhiteboardName)
    
function validateWhiteboardName(){
    let nameInput = document.getElementById("whiteboard-name")

    const newWhiteboard = nameInput.value.trim()

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

// redirect user to blank whiteboard
function redirectToNewWhiteBoard(whiteboardName) {
    console.log("redirecting")
    window.location.href = `./../whiteboard/home.html?u=${userId}&p=${whiteboardName}`
}




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

// log out the user 
function logOut() {
    localStorage.removeItem("authToken")
    window.location.href = `./../index.html`
}



