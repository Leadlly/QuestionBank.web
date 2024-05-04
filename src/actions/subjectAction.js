import {
    CREATE_SUBJECT_REQUEST,
    CREATE_SUBJECT_SUCCESS,
    CREATE_SUBJECT_FAIL,
    GET_SUBJECTS_REQUEST,
    GET_SUBJECTS_SUCCESS,
    GET_SUBJECTS_FAIL,
    CLEAR_ERRORS,
} from "../constants/subjectConstants";
import axios from "axios";
import { server } from "../main"; 



export const createSubject = (subjectData) => async (dispatch) => {
  try {
      dispatch({ type: CREATE_SUBJECT_REQUEST });

      const response = await axios.post(`${server}/api/create/subject`, subjectData, {
          headers: {
              'Content-Type': 'application/json',
          },
          withCredentials: true,
      });

      dispatch({
          type: CREATE_SUBJECT_SUCCESS,
          payload: response.data,
      });

      return response.data;
  } catch (error) {
      dispatch({
          type: CREATE_SUBJECT_FAIL,
          payload: error.response?.data?.message || error.message,
      });

      return Promise.reject(error.response?.data?.message || error.message);
  }
};


export const getSubjects = (standard) => async (dispatch) => {
    try {
      dispatch({ type: GET_SUBJECTS_REQUEST });
  
      const { data } = await axios.get(`${server}/api/get/subject?standard=${standard}`, {
        withCredentials: true,
      });
  
      dispatch({
        type: GET_SUBJECTS_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: GET_SUBJECTS_FAIL,
        payload: error.response?.data?.message || error.message,
      });
    }
  };

export const clearErrors = () => (dispatch) => {
    dispatch({ type: CLEAR_ERRORS });
};
