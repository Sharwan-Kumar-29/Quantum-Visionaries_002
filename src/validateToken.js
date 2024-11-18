// checks the token validity 
export async function checkTokenValidity(token) {
    const API_KEY = "AIzaSyAMEfr0Ge_MZPTZbNH75kOxQS2sjNuzhdQ"
    const URL = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`

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
            let res = await resp.json()
            // token valid, redirect to dashboard
            return {status: true}
        }
        else {
            // Invalid token (expired)
            let err = await resp.json()
            console.log(err, err.error.message)
            localStorage.removeItem("authToken")
            return {status: false, err: err.error.message}

        }
    } catch (error) {
        console.log("Error while validating the token", error)
        return {status: false, err: err.error.message}
    }

}

// get user id 
export async function getUserId(token) {
    const API_KEY = "AIzaSyAMEfr0Ge_MZPTZbNH75kOxQS2sjNuzhdQ";
    const URL = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`;

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ idToken: token })
    };

    try {
        // fetch user's data from Firebase Auth API
        let resp = await fetch(URL, requestOptions);
        
        if (resp.ok) {
            // user id found
            const res = await resp.json();
            
            if (res.users && res.users.length > 0) {
                return { status: true, userId: res.users[0].localId };
            } else {
                console.error("No users found in the response", res);
                return { status: false, error: "No users found" };
            }
        } else {
            // Handle the error case (not a valid response)
            const errorRes = await resp.json();
            console.error("API error:", errorRes.error.message);
            return { status: false, error: errorRes.error.message };
        }
    } catch (error) {
        console.error("Error getting user's ID:", error);
        return { status: false, error: error.message };
    }
}
