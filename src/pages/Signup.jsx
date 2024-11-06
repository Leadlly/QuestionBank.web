import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import "../styles/login.scss";
import { register } from "../actions/userAction";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.register);

  const handleSignUp = async (e) => {
    e.preventDefault();

    dispatch(register({ name, email, password }))
      .then(() => {
        toast.success("Registration request sent. Please wait for admin approval.");
        setName("");
        setEmail("");
        setPassword("");
      })
      .catch((error) => {
        if (error) {
          const errorMessage = typeof error === "string"
            ? error 
            : error.response && error.response.data && error.response.data.message
              ? error.response.data.message
              : "Something went wrong";
          
          toast.error(errorMessage);
          dispatch(clearErrors());
        }
        
      });
  };

  return (
    <>
      <div id="signin_page" className="flex flex-col">
        <div className="signin-box">
          <h2>Welcome to Leadlly</h2>
          <form onSubmit={handleSignUp}>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {isLoading ? (
              <input type="submit" disabled value="Loading..." />
            ) : (
              <input type="submit" value="SignUp" />
            )}
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUp;
