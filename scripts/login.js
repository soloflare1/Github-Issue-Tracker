const $ = (id) => document.getElementById(id);

// login()

const login = () => {
  
  const username = $("usernameInput").value.trim();
  const password = $("passwordInput").value.trim();
  const errorBox = $("loginError");

  if(username === "admin"  && password === "admin123"){
    $("loginPage").classList.add("hidden");
    $("mainApp").classList.remove("hidden");
    errorBox.classList.add("hidden");

    fetchAllIssues();
  }
  else
    errorBox.classList.remove("hidden");
    
}

// signOut()

// const signOut = () =>{
//   $("mainApp").classList.add("hidden");
//   $("loginPage").classList.remove("hidden");

//   $("usernameInput").value = "";
//   $("passwordInput").value = "";
//   $("searchInput").value = "";
// }