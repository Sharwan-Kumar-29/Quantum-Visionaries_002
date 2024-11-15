
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



// open blank whiteboard option
const blankWhiteboard = document.getElementById("blank-whiteboard")
blankWhiteboard.addEventListener("click", () => {
    window.location.href = `./../whiteboard/home.html`
})



// get user id from google authentication api request 
async function getUserId() {
    const API_KEY = "AIzaSyD4sqsxSpMI58pH2DimueULkR_PCVWEUdY"
    const URL = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`;
    
    
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken: token })
    }

    try {
        let resp = await fetch(URL, requestOptions)
        if (resp.ok) {
            const res = await resp.json();
            
            // get userId from the response 
            const userId = res.users[0].localId;
            // fetch users data from database
            fetchUserData(userId)

        } else {
            const err = await resp.json();
            // alert(err.error.message)
            console.error('Error fetching user data:', err.error.message);
            if (err.error.message === 'TOKEN_EXPIRED') {
                redirectTologin()
            }
        }
    } catch (err) {
        // error while fetching
        console.error(err);
    }
}

// fetch users data from database 
async function fetchUserData(id){
    const API_KEY = "AIzaSyD4sqsxSpMI58pH2DimueULkR_PCVWEUdY";
    const URL = `https://user-authentication-ebb7d-default-rtdb.firebaseio.com/users/${id}.json`

    try{
        const resp = await fetch(URL)

        if(resp.ok){
            const res = await resp.json()
            console.log(res)
            // displayUserData(res)
        }
        else{
            const err = await resp.json()
            console.log(err)
        }
    }
    catch(err){
        console.log(err)
    }
}

// display user data 
function displayUserData(user){

}


// show recent whiteboards
function displayRecentWhiteboards(whiteboards) {
    let recentWhiteboards = document.getElementById("recent-whiteboards")

    // iterate through each whiteboards
    for (let whiteboard in whiteboards) {

        // get the date of whiteboard stored
        let date = new Date(whiteboards[whiteboard].timestamp)
        // change date to canadian format 2024/11/15
        date = date.toLocaleDateString('en-CA')

        // create new div for each stored whiteboard
        let newDiv = document.createElement('div')
        // add the whiteboard
        let imgDiv = document.createElement('div')
        imgDiv.innerHTML = `<img src="${whiteboards[whiteboard].drawing}"></img>`

        let datePara = document.createElement('p')
        datePara.textContent = date

        newDiv.append(imgDiv, datePara)

        // append data on web page 
        recentWhiteboards.appendChild(newDiv)
        newDiv.addEventListener('click', () => {
            window.location.href = `./../whiteboard/home.html?${whiteboard}`
        })
    }
}

// redirect the user 
function redirectTologin(){
    window.location.href = `./../signIn/signIn.html`
}

// log out the user 
function logOut() {
    localStorage.removeItem("authToken")
    window.location.href = `./../index.html`
}

