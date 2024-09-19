import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CreateQuestion from "./pages/CreateQuestion";
import toast, { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import SignUp from "./pages/Signup";
import Navbar from "./components/Navbar";
import CreateChapter from "./pages/CreateChapter";
import CreateTopic from "./pages/CreateTopic";
import CreateSubject from "./pages/CreateSubject";
import CreateSubtopic from "./pages/CreateSubtopic";
import Requests from "./pages/Requests";
// import Profile from "./pages/Profile";
import { clearErrors, profile } from "./actions/userAction";
import EditDetails from "./pages/EditDetails";
import ProfileHead from "./components/ProfileHead";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, error, user } = useSelector((state) => state.user);

  useEffect(() => {
    if (error) {
      toast.error(
        error.response ? error.response.data.message : "Something went wrong"
      );
      dispatch(clearErrors());
    }
    dispatch(profile());
  }, [dispatch]);

  window.addEventListener("contextmenu", (e) => e.preventDefault());

  const isAdmin = user && user.role === "admin";
  console.log(isAdmin);
  return (
    <Router>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <CreateQuestion /> : <Login />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <ProfileHead /> : <Login />}
        />
        {isAdmin && (
          <>
            <Route
              path="/chapter"
              element={isAuthenticated ? <CreateChapter /> : <Login />}
            />
            <Route
              path="/topic"
              element={isAuthenticated ? <CreateTopic /> : <Login />}
            />
            <Route
              path="/subtopic"
              element={isAuthenticated ? <CreateSubtopic /> : <Login />}
            />
            <Route
              path="/subject"
              element={isAuthenticated ? <CreateSubject /> : <Login />}
            />
            <Route
              path="/request"
              element={isAuthenticated ? <Requests /> : <Login />}
            />
            <Route
              path="/editdetails"
              element={isAuthenticated ? <EditDetails /> : <Login />}
            />
          </>
        )}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
