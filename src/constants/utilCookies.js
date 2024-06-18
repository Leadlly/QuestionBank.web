// utilCookies.js

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  
  function getAPITokenConfig() {
    const token = getCookie("token") || "";
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-Type": "application/json",
      },
      // credentials: "include",
      // withCredentials: true,
    };
    return config;
  }
  
  export { getAPITokenConfig, getCookie };
  