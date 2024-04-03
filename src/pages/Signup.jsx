import React, { useState, useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/login.scss";
import { server } from "../main";
import { Context } from "../main";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMesasge] = useState("");
  const { isAuthenticated, setIsAuthenticated, isLoading, setIsLoading } =
    useContext(Context);
  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/user/register`,
        {
          name,
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      toast.success(data.message);
      setMesasge(data.message);
      setIsLoading(false);
      setName("");
      setEmail("");
      setPassword("");
      //   setIsAuthenticated(true);
    } catch (error) {
      
      toast.error(error.response.data.message || "Something went wrong");
      //   setIsAuthenticated(false);
      setIsLoading(false);
    }
  };
  //   if (isAuthenticated) return <Navigate to={"/"} />;

  return (
    <>
      <div id="signin_page" className="flex flex-col">
        <div className="signin-box">
          <h2>Welcome to leadlly</h2>
          <form onSubmit={handleSignUp}>
            <input
              type="text"
              placeholder="Enter you name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Enter you email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Enter you password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input type="checkbox" id="" />
            {isLoading === true ? (
              <input type="submit" disabled value="SignUp" />
            ) : (
              <input type="submit" id="" value="SignUp" />
            )}
            <p>
              Already have account? <Link to="/">Login</Link>
            </p>
          </form>
        </div>
        <h2 className="m-10 text-green-500">{message}</h2>
      </div>
    </>
  );
};

export default SignUp;
