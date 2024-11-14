

function profile(){
    console.log("profile")
}


function displaySideNavbar(){
    console.log("clicked")
    let sideNav = document.getElementById("side-nav")

    sideNav.style.display = "block";
}
function hideSideNavbar(){
    let sideNav = document.getElementById("side-nav")

    sideNav.style.display = "none";
}
