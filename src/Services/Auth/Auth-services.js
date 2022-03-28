import axios from "axios";
import {setGlobalState} from "../../StateAuth";

const TOKEN_URL = "https://employee-webserver.herokuapp.com/auth/token"
const AUTH_URL = "https://employee-webserver.herokuapp.com/auth"

function refreshToken(){
    axios.post(TOKEN_URL, {}, {withCredentials: true})
        .then(function (response){
            if (response.statusText === "OK"){
                startRefreshTokenTimer()
            }else {
                localStorage.removeItem("currentUser")
                localStorage.removeItem("initialTime")
            }
        })
}

let refreshTokenTimeout;
function startRefreshTokenTimer(){
    if(localStorage.getItem("currentUser")){
        var waitTime = 840000;
        var executionTime;
        var initialTime = localStorage.getItem("initialTime");

        if (initialTime === null) {
            localStorage.setItem("initialTime", new Date().getTime());
            executionTime = waitTime;
        }
        else {
            executionTime = parseInt(initialTime, 10) + waitTime - (new Date()).getTime();
            if (executionTime < 0) executionTime = 0
        }

        refreshTokenTimeout = setTimeout(() => {
            refreshToken()
            localStorage.removeItem("initialTime")
        }, executionTime)
    }
}

function stopRefreshTokenTimer(){
    localStorage.removeItem("initialTime");
    clearInterval(refreshTokenTimeout)
}
function verifyEmail(){
    var email = localStorage.getItem("userEmail")
    axios.post(AUTH_URL + "/resent-email/" + email, {})
        .then(res => {
            console.log(res)
        })
}

function LoginAuth(email, password, navigate){
    axios.post(AUTH_URL + "/signin",
        {email, password}, {withCredentials: true})
        .then(response => {
            localStorage.setItem("currentUser", JSON.stringify(response.data))
            localStorage.setItem("initialTime", String((new Date()).getTime()));
            localStorage.removeItem("userEmail")
            setGlobalState("isAuth", true)
            startRefreshTokenTimer()
            navigate("/")
        })

}

function RegistrationAuth(email, password, navigate){
    axios.post(AUTH_URL + "/signup",
        {email, password}, {withCredentials: true})
        .then(response => {
            if (response.statusText === "OK"){
                navigate("/verify-email")
                localStorage.setItem("userEmail", email)
            }
            else{
                alert("Error")
            }
    })

}
function Logout(navigate){
    axios.post(AUTH_URL + "/logout", "", {withCredentials:true})
        .then(res => {
            localStorage.removeItem("currentUser")
            setGlobalState("isAuth", false)
            stopRefreshTokenTimer()
            navigate("/login")
        })
}

export {
    LoginAuth,
    RegistrationAuth,
    Logout,
    startRefreshTokenTimer,
    verifyEmail
}