import {
    CREATE_CHAPTER_REQUEST,
    CREATE_CHAPTER_SUCCESS,
    CREATE_CHAPTER_FAIL,
    GET_CHAPTERS_REQUEST,
    GET_CHAPTERS_SUCCESS,
    GET_CHAPTERS_FAIL,
    CLEAR_ERRORS,
} from "../constants/chapterConstants";
import axios from "axios";
import { server } from "../main";

export const createChapter = (chapterData) => async (dispatch) => {
    try {
        dispatch({ type: CREATE_CHAPTER_REQUEST });

        const { data } = await axios.post(`${server}/api/v1/create/chapter`, chapterData, {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true,
        });

        dispatch({
            type: CREATE_CHAPTER_SUCCESS,
            payload: data,
        });
    } catch (error) {
        dispatch({
            type: CREATE_CHAPTER_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const getChapters = (subjectName, standard) => async (dispatch) => {
    try {
        dispatch({ type: GET_CHAPTERS_REQUEST });

        const { data } = await axios.get(`${server}/api/v1/get/chapter?subjectName=${subjectName}&standard=${standard}`, {
            withCredentials: true,
        });

        dispatch({
            type: GET_CHAPTERS_SUCCESS,
            payload: data.chapters,
        });
    } catch (error) {
        dispatch({
            type: GET_CHAPTERS_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const clearErrors = () => (dispatch) => {
    dispatch({ type: CLEAR_ERRORS });
};
