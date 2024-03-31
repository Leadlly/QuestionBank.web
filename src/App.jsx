import { useEffect } from "react";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import CreateQuestion from "./pages/CreateQuestion";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import SignUp from "./pages/Signup";
function App() {
  return (
   <Router>
    <Routes>
      <Route exact path="/login" element={<Login/>} />
      <Route exact path="/signup" element={<SignUp/>} />
      <Route exact path="/" element={<CreateQuestion/>} />
    </Routes>
    <Toaster/>
   </Router>
  );
}

export default App;
