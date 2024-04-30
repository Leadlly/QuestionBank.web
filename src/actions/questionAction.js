import {
    CREATE_QUESTION_REQUEST,
    CREATE_QUESTION_SUCCESS,
    CREATE_QUESTION_FAIL,
    CLEAR_ERRORS
} from "../constants/questionConstants.js"

import axios from "axios";
import { server } from "../main.jsx";

export const createQuestion = (questionData) => async (dispatch) => {
    try {
        dispatch({ type: CREATE_QUESTION_REQUEST });

        const { data } = await axios.post(`${server}/api/create/question`, questionData, {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true,
        });

        dispatch({
            type: CREATE_QUESTION_SUCCESS,
            payload: data.question,
        });
    } catch (error) {
        dispatch({
            type: CREATE_QUESTION_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};

export const clearErrors = () => (dispatch) => {
    dispatch({ type: CLEAR_ERRORS });
};