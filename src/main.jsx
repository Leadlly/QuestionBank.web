import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createContext, useState } from "react";
import { Provider } from "react-redux";
import store from "./Store.js";

export const server = import.meta.env.VITE_QUESTION_BANK_API;

export const Context = createContext({
  isAuthenticated: false,
  isLoading: false,
});
const Appwrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({});

  return (
    <Context.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        isLoading,
        setIsLoading,
        profile,
        setProfile,
      }}
    >
      <Provider store={store}>

      <App />
      </Provider>
    </Context.Provider>
  );
};
const rootContainer = document.getElementById("root");
if (!rootContainer.hasChildNodes()) {
  ReactDOM.createRoot(rootContainer).render(
    <React.StrictMode>
      <Appwrapper />
    </React.StrictMode>
  );
}
