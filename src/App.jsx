import { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import CreateSubtopic from "./pages/CreateSubtopic";
import Requests from "./pages/Requests";
import Profile from "./pages/Profile";

function App() {
  const { isAuthenticated, setIsAuthenticated, setProfile } =
    useContext(Context);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${server}/api/user/profile`, {
          withCredentials: true,
        });
        setProfile(data?.user);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        console.error("Failed to fetch data:", error);
      }
    })();
  }, []);

  return (
    <Router>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route
          exact
          path="/"
          element={isAuthenticated ? <CreateQuestion /> : <Login />}
        />
        <Route
          exact
          path="/chapter"
          element={isAuthenticated ? <CreateChapter /> : <Login />}
        />
        <Route
          exact
          path="/topic"
          element={isAuthenticated ? <CreateTopic /> : <Login />}
        />
        <Route
          exact
          path="/subtopic"
          element={isAuthenticated ? <CreateSubtopic /> : <Login />}
        />
        <Route
          exact
          path="/subject"
          element={isAuthenticated ? <CreateSubject /> : <Login />}
        />
        <Route
          exact
          path="/request"
          element={isAuthenticated ? <Requests /> : <Login />}
        />
        <Route
          exact
          path="/profile"
          element={isAuthenticated ? <Profile /> : <Login />}
        />
        <Route
          exact
          path="/signup"
          element={ <SignUp />}
        />
       
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
