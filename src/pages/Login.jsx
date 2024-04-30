import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import "../styles/login.scss";
import { Link, useNavigate, } from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import { clearErrors, login } from "../actions/userAction";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.user);


  const loginSubmit = (e) => {
    e.preventDefault();
    dispatch(login(email, password));
      
  };
 
  useEffect(() => {
    
    if (isAuthenticated) {
      console.log("Navigating to");
      navigate("/");
    }
    console.log("Login useEffect: error =", error, "isAuthenticated =", isAuthenticated);
    if (error) {
        toast.error(error.response ? error.response.data.message : "Something went wrong");
        dispatch(clearErrors());
    }
}, [error, isAuthenticated, navigate, dispatch]);

  

  return (
    <>
      <div id="signin_page">
        <div className="signin-box">
          <h2>Welcome to leadlly</h2>
          <form onSubmit={loginSubmit}>
            <input
              type="email"
              placeholder="Enter you email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Enter you password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input type="checkbox" />
            {isLoading === true ? (
              <input
                type="submit"
                disabled
                value="Login"
                className="bg-slate-600"
              />
            ) : (
              <input type="submit" value="Login" />
            )}
            <p>
              Didnt have account? <Link to="/signup">SignUp</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;

