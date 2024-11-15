let signupForm = document.getElementById("signup-form")

// on form submit 
signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // get username, email and password, remove trailing and leading spaces
    const username = document.getElementById("username").value.trim()
    const email = document.getElementById("signup-email").value.trim()
    const password = document.getElementById("signup-password").value.trim()

    // users data as obj
    const userData = {
        username: username,
        email: email,
        password: password,
    }

    // password length
    if (password.length >= 6) {
        // validate and store user data 
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
        if (response.ok) {
            let res = await response.json()
            const data = {
                userId: res.localId,
                idToken: res.idToken,
            }
            storeDataToFirebase(userData, data)
        }
        else {
            // response error
            let res = await response.json()
            alert(res.error.message)
        }
        // network request error
    } catch (err) {
        alert("Network error, Try after some time")
        console.error(err)
    }
}


// store data in firebase
async function storeDataToFirebase(userData, data) {
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

    // try storing the data to firebase database
    try {
        let resp = await fetch(URL, requestOptions)
        if (!resp.ok) {
            let err = await resp.json()
            console.log(err.error.message)
        }
        else{
            alert("Sign up successful, redirecting to login")
            redirectTologin()
        }
    } catch (err) {
        // fetch request error
        console.error(err.error.message)
    }
}

// redirect user to login 
function redirectTologin(){
    window.location.href = `./signIn.html`
}