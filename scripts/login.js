const $ = (id) => document.getElementById(id);

// login()

const login = () => {
  const username = $("usernameInput").value.trim();
  const password = $("passwordInput").value.trim();
  const errorBox = $("loginError");

    if(username === "admin"  && password === "admin123") {
        window.location.href = 'index.html' ;
    }
    else{
        errorBox.classList.remove("hidden"); 
    }    
}


document.addEventListener("keydown", (e) => {
    if(e.key === "Enter")   login();
});

// const signOut = () => {
//   window.location.href = "login.html"
// };
