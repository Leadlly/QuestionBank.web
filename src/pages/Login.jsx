import React, { useState, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/login.scss";
import { Link, Navigate } from "react-router-dom";
import { server } from "../main";
import { Context } from "../main";
// import Spinner from "./Spinner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isAuthenticated, setIsAuthenticated, isLoading, setIsLoading } =
    useContext(Context);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/user/login`,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true
        },
      );
      toast.success(data.message);
      setIsLoading(false);
      setIsAuthenticated(true);
    } catch (error) {
      toast.error(error.response.data.message);
      setIsLoading(false);
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated) return <Navigate to={"/"} />;

  return (
    <>
      <div id="signin_page">
      <div className="signin-box">
        <h2>Welcome to leadlly</h2>
        <form onSubmit={handleLogin}>
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
          <input type="checkbox" id="" />
          {isLoading ? <input type="submit" disabled value="Login" /> :  <input type="submit" id="" value="Login" />}
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


// import React, { useState } from "react";
// import { Link, Navigate } from "react-router-dom";
// import "./signin.scss";
// import { useDispatch, useSelector } from "react-redux";
// import { loginUser } from "../../action/userAction";
// import { getProducts } from "../../action/productAction";

// const Login = ({setProgress}) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const dispatch = useDispatch();
//   const { isAuthenticated } = useSelector((state) => state.user);

//   const handleLogin = async(e) => {
//     setProgress(10)
//     e.preventDefault();
//     await dispatch(loginUser(email, password));
//     setProgress(60)
//     await dispatch(getProducts())
//     setProgress(100)
//   };

//   if (isAuthenticated) return <Navigate to={"/"} />;

//   return (
//     <div id="signin_page">
//       <div className="signin-box">
//         <h2>Welcome back</h2>
//         <form onSubmit={handleLogin}>
//           <input
//             type="email"
//             placeholder="Enter you email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <input
//             type="password"
//             placeholder="Enter you password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//           <input type="checkbox" id="" />
//           <input type="submit" id="" value="Login" />
//           <p>
//             Didn't have account? <Link to="/register">SignUp</Link>
//           </p>
//         </form>
//         <form>
//           <input type="text" placeholder="Login with google" />
//           <input type="text" placeholder="Login with github" />
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;