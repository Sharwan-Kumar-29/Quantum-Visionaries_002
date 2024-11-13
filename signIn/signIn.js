// sign in validation
let signinForm = document.getElementById("signin-form")


// form submit event listener
signinForm.addEventListener("submit", (e)=>{
    e.preventDefault();

    // get email and password
    const email = document.getElementById("signin-email").value 
    const password = document.getElementById("signin-password").value 

    // console.log(email, password)
    let userData = {
        email : email,
        password: password,
    }

    const resp = validateLogin(userData)
})


// function to validate login Credentials 
async function validateLogin(userData){
    const API_KEY = "AIzaSyD4sqsxSpMI58pH2DimueULkR_PCVWEUdY"

    const URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`

    const requestOptions = {
        method: "POST",
        headers: {
            "content-Type" : "application/json"
        },
        body : JSON.stringify({email: userData.email, password: userData.password, returnSecureToken: true,})
    }

    try{
        let resp = await fetch(URL, requestOptions)

        if(resp.ok){
            let res = await resp.json()
            alert("Login successful")
            console.log(res)
        }
        else{
            let err = await resp.json()
            alert(err.error.message)
            console.error(err)
            signinForm.reset()
        }
    }
    catch(err){
        console.log(err)
        alert("Something went wrong, please try again later")
    }


}