import {
    CREATE_QUESTION_REQUEST,
    CREATE_QUESTION_SUCCESS,
    CREATE_QUESTION_FAIL,
    DELETE_QUESTION_REQUEST,
    DELETE_QUESTION_SUCCESS,
    DELETE_QUESTION_FAIL,
    CLEAR_ERRORS
} from "../constants/questionConstants.js"

import axios from "axios";
import { server } from "../main.jsx";
import toast from "react-hot-toast";

export const createQuestion = (questionData) => (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({ type: CREATE_QUESTION_REQUEST });

        axios.post(`${server}/api/create/question`, questionData, {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true,
        })
        .then(response => {
            const { data } = response;
            dispatch({
                type: CREATE_QUESTION_SUCCESS,
                payload: {
                    question: data.question,
                    signedUrls: data.signedUrls, // Dispatch signedUrls along with question
                },
            });
            resolve(data);
        })
        .catch(error => {
            const errorMessage = error.response && error.response.data.message
                ? error.response.data.message
                : error.message;

            dispatch({
                type: CREATE_QUESTION_FAIL,
                payload: errorMessage,
            });
            toast.error(errorMessage)

            reject(errorMessage);
        });
    });
};


export const deleteQuestion = (id) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_QUESTION_REQUEST });

        const { data } = await axios.delete(`${server}/api/delete/${id}`, {
            withCredentials: true,
        });

        dispatch({
            type: DELETE_QUESTION_SUCCESS,
            payload: data,
        });

        return data; 
    } catch (error) {
        dispatch({
            type: DELETE_QUESTION_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
        return error; 
        
    }
};


export const checkQuestionExists = async (questionData) => {
    try {
      const response = await axios.post(`${server}/api/create/question`, questionData,{
        headers: {
            "Content-Type": "application/json",
        },
        withCredentials: true,
      });
  
      return response.data.exists;
    } catch (error) {
      console.error('Error checking question existence:', error);
      throw error;
    }
  };

export const clearErrors = () => (dispatch) => {
    dispatch({ type: CLEAR_ERRORS });
};