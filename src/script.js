import { checkTokenValidity } from "./validateToken.js"  


let startedBtn = document.getElementById("get-started")


// check for token in local storage and also check validity
const isTokenValid = async function() {
    const token = localStorage.getItem("authToken")
    if(token){
        const isValid = await checkTokenValidity(token)
        if(isValid.status){
            redirectToDashboard()
        }
        else{
            redirectTologin()
        }
    }
    else{
        redirectTologin()
    }
}

// checkTokenValidity
startedBtn.addEventListener("click", isTokenValid)

// redirect to login if no valid token found
function redirectTologin() {
    window.location.href = `./signIn/signIn.html`
}

// redirect to dashboard
function redirectToDashboard(){
    window.location.href = `./dashboard/dashboard.html`
}