// checks the token validity 
export async function checkTokenValidity(token) {
    const API_KEY = "AIzaSyAMEfr0Ge_MZPTZbNH75kOxQS2sjNuzhdQ"
    const URL = `https:identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ idToken: token })
    }
    try {
        // fetch the validity of token 
        let resp = await fetch(URL, requestOptions)
        if (resp.ok) {
            // token valid, redirect to dashboard
            return {status: true}
        }
        else {
            // Invalid token (expired)
            localStorage.removeItem("authToken")
            return {status: false}

        }
    } catch (error) {
        console.log("Error while validating the token", error)
        return {status: false}
    }

}

export async function getUserId(token) {
    const API_KEY = "AIzaSyAMEfr0Ge_MZPTZbNH75kOxQS2sjNuzhdQ"
    const URL = `https:identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ idToken: token })
    }
    try {
        // fetch users data
        let resp = await fetch(URL, requestOptions)
        if (resp.ok) {
            // user id found
            const res = await resp.json()
            return {value: res.users[0].localId}
        }
        else {
            // No user id obtained
            return {value: false}

        }
    } catch (error) {
        console.log("Error getting users id", error)
        return {value: false}
    }

}
