import { useContext, useEffect } from "react";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import CreateQuestion from "./pages/CreateQuestion";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import SignUp from "./pages/Signup";
import { Context, server } from "./main";
import axios from "axios";
import Navbar from "./components/Navbar";
import CreateChapter from "./pages/CreateChapter";
import CreateTopic from "./pages/CreateTopic";
import CreateSubject from "./pages/CreateSubject";
import Requests from "./pages/Requests";

function App() {
 
  const {isAuthenticated, setIsAuthenticated, setProfile} = useContext(Context)

  console.log(isAuthenticated)
  useEffect(() =>{
    (async() => {
     try {
       // Let's say we're fetching data from an API
       const {data} = await axios.get(`${server}/api/user/profile`, {
        withCredentials: true
       });
       setProfile(data?.user)
       setIsAuthenticated(true)
     } catch (error) {
       setIsAuthenticated(false)
       console.error("Failed to fetch data:", error);
     }
    })()
   }, [])

  return (
   <Router>
    {isAuthenticated && <Navbar/>}
    <Routes>
      <Route exact path="/" element={isAuthenticated ? <CreateQuestion/> : <Login/>} />
      <Route exact path="/chapter" element={isAuthenticated ? <CreateChapter/> : <Login/>} />
      <Route exact path="/topic" element={isAuthenticated ? <CreateTopic/> : <Login/>} />
      <Route exact path="/subject" element={isAuthenticated ? <CreateSubject/> : <Login/>} />
      <Route exact path="/request" element={isAuthenticated ? <Requests/> : <Login/>} />
      <Route exact path="/signup" element={isAuthenticated ? <CreateQuestion/> : <SignUp/>} />
    </Routes>
    <Toaster/>
   </Router>
  );
}

export default App;
