let signupForm = document.getElementById("signup-form")


signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // get username, email and password 
    // const username = document.getElementById("username").value 
    const email = document.getElementById("signup-email").value
    const password = document.getElementById("signup-password").value

    const userData = {
        email: email,
        password: password,
    }
    // validate password 
    if (password.trim().length >= 6) {
        console.log(email, password)
        validateSignUp(userData)
    }
    else {
        alert("Invalid password format")
    }
})


// signUp authentication
async function validateSignUp(userData) {
    // api and url to validate users data
    const API_KEY = "AIzaSyD4sqsxSpMI58pH2DimueULkR_PCVWEUdY"
    const URL = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`


    const requestOptions = {
        method: "POST",
        headers: {
            "content-Type": "application/json"
        },
        body: JSON.stringify({ ...userData, returnSecureToken: true, })
    }
    try {
        let response = await fetch(URL, requestOptions)
        if(response.ok){
            let res = await response.json()
            const data = {
                userId : res.localId,
                idToken : res.idToken,
            }
            let store = storeData(userData, data)
            if(store){
                alert("Sign up successful, Login please")
                window.location.href = "./signIn.html"
            }
        }
        else{
            let res = await response.json()
            console.log(res.error.message)
            alert(res.error.message)
        }
    } catch (err) {
        alert("Network error, Try after some time")
        console.error(err)
    }
}


// store data in firebase
async function storeData(userData, data) {
    // store data at this url 
    const URL = `https://user-authentication-ebb7d-default-rtdb.firebaseio.com/users/${data.userId}.json`

    const bodyObj = {
        "userId": data.userId,
        "email": userData.email,
        "password": userData.password,
    }

    const requestOptions = {
        method: "PUT",
        headers: {
            "content-Type": "application/json",
        },
        body: JSON.stringify(bodyObj),
    }

    // try storing the data to project database
    try {
        let resp = await fetch(URL, requestOptions)
        if(!resp.ok){
            let err = await resp.json()
            console.log(err)
            return false
        }
        return true
    } catch (err) {
        console.error(err)
        return false
    }

}