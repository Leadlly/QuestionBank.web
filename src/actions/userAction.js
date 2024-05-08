import { 
  LOGIN_REQUEST,
 LOGIN_SUCCESS,
 LOGIN_FAIL,
 CLEAR_ERRORS, 
 PROFILE_REQUEST,
 PROFILE_SUCCESS,
 LOGOUT_SUCCESS,
    LOGOUT_FAIL,
    REGISTER_REQUEST,
    REGISTER_SUCCESS,
    REGISTER_FAIL,
 PROFILE_FAIL,
 FETCH_USER_QUESTIONS,
 FETCH_USER_QUESTIONS_SUCCESS,
 FETCH_USER_QUESTIONS_FAILURE
} from "../constants/userConstants";

import axios from "axios";
import { server } from "../main";



export const login = (email, password) => async (dispatch) => {
    try {
        dispatch({type: LOGIN_REQUEST});
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
          withCredentials: true,
        }
      );
      dispatch({type: LOGIN_SUCCESS, payload: data.user});
    } catch (error) {
      dispatch({type: LOGIN_FAIL, payload: error.response.data.message})
    }
  };



  export const profile = () => async (dispatch) => {
    try {
      dispatch({type: PROFILE_REQUEST});
      const {data} = await axios.get(`${server}/api/user/profile`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
      dispatch({type: PROFILE_SUCCESS, payload: data.user});
    } catch (error) {
      dispatch({ type: PROFILE_FAIL, payload: error.response.data.message})
    }
  }

  export const logout = () => async (dispatch) => {
    try {
        const { data } = await axios.get(`${server}/api/user/logout`, {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true,
        });

        if (data.success) {
            dispatch({ type: LOGOUT_SUCCESS });
        } else {
            dispatch({ type: LOGOUT_FAIL, payload: data.message });
        }
    } catch (error) {
        const errorMsg = error.response?.data?.message || "Failed to log out";
        dispatch({ type: LOGOUT_FAIL, payload: errorMsg });
    }
};

export const register = (userData) => async (dispatch) => {
  try {
      dispatch({ type: REGISTER_REQUEST });

      const { data } = await axios.post(`${server}/api/user/register`, userData, {
          headers: {
              "Content-Type": "application/json",
          },
          withCredentials: true,
      });

      dispatch({
          type: REGISTER_SUCCESS,
          payload: data,
      });
  } catch (error) {
      dispatch({
          type: REGISTER_FAIL,
          payload: error.response && error.response.data.message
              ? error.response.data.message
              : error.message,
      });
  }
};

export const fetchUserQuestions = (standard) => async (dispatch) => {
  dispatch({ type: FETCH_USER_QUESTIONS });

  try {
      const response = await axios.get(`${server}/api/user/myquestion?standard=${standard}`, {
          withCredentials: true,
      });

      if (response.data.success) {
          dispatch({ type: FETCH_USER_QUESTIONS_SUCCESS, payload: response.data.questions });
      } else {
          dispatch({ type: FETCH_USER_QUESTIONS_FAILURE, payload: response.data.message });
      }
  } catch (error) {
      dispatch({ type: FETCH_USER_QUESTIONS_FAILURE, payload: error.message });
  }
};

export const clearErrors = () => async (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};