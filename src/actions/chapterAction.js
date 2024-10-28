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

        const response = await axios.post(`${server}/api/create/chapter`, chapterData, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });

        dispatch({
            type: CREATE_CHAPTER_SUCCESS,
            payload: response.data,
        });

        return response.data;
    } catch (error) {
        const errorResponseData = error.response?.data;

        const errorMessage = errorResponseData?.message || error.message;
        dispatch({
            type: CREATE_CHAPTER_FAIL,
            payload: errorMessage,
        });

        return Promise.reject(errorMessage);
    }
};


export const getChapters = (subjectName, standard) => async (dispatch) => {
    try {
        dispatch({ type: GET_CHAPTERS_REQUEST });

        const { data } = await axios.get(`${server}/api/get/chapter?subjectName=${subjectName}&standard=${standard}`, {
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


export const getChaptersByIds = async(chapterIds) => {
    try {

        console.log(chapterIds, "====> here")

        const { data } = await axios.post(`${server}/api/get/chapters`, {chapterIds}, {
            withCredentials: true,
        });

        return data
    } catch (error) {
        console.log(error)
    }
};


export const clearErrors = () => (dispatch) => {
    dispatch({ type: CLEAR_ERRORS });
};
