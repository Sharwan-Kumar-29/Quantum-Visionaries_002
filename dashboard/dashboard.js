// open blank whiteboard
const blankWhiteboard = document.getElementById("blank-whiteboard")
blankWhiteboard.addEventListener("click", ()=>{
    window.location.href = `./../whiteboard/home.html`
})



function profile(){
    console.log("profile")
}

// side navbar for small width screen  
function displaySideNavbar(){
    console.log("clicked")
    let sideNav = document.getElementById("side-nav")

    sideNav.style.display = "block";
}
function hideSideNavbar(){
    let sideNav = document.getElementById("side-nav")

    sideNav.style.display = "none";
}

// hide side navbar for mid and large screen size 
window.addEventListener("resize", ()=>{
    const sideNav = document.getElementById("side-nav")

    let width = window.innerWidth;
    if(width>480){
        sideNav.style.display = "none"
    }
})


// fetch saved whiteboards 
fetchWhiteboards()
async function fetchWhiteboards() {
    
    const databaseURL = "https://whiteboard-5795a-default-rtdb.firebaseio.com/whiteboard_data.json";

    try {
        let resp = await fetch(databaseURL)
        if(resp.ok){
            let res = await resp.json()
            displayRecentWhiteboards(res)
        }
        else{
            let error = await resp.json()
            console.log(error)
            alert(err.error.message)
        }
    } catch (error) {
        console.log(error)
    }
}

// show recent whiteboards after fetch
function displayRecentWhiteboards(whiteboards){
    let recentWhiteboards = document.getElementById("recent-whiteboards")

    // iterate through each whiteboards
    for(let whiteboard in whiteboards){

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
        datePara. textContent = date

        newDiv.append(imgDiv, datePara)

        // append data on web page 
        recentWhiteboards.appendChild(newDiv)
        newDiv.addEventListener('click',()=>{
            window.location.href = `./../whiteboard/home.html?${whiteboard}`
        })
    }
}