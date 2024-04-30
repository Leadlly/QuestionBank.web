import {
    CREATE_SUBTOPIC_REQUEST,
    CREATE_SUBTOPIC_SUCCESS,
    CREATE_SUBTOPIC_FAIL,
    GET_SUBTOPICS_REQUEST,
    GET_SUBTOPICS_SUCCESS,
    GET_SUBTOPICS_FAIL,
    CLEAR_ERRORS,
} from "../constants/subtopicConstants";
import axios from "axios";
import { server } from "../main";

export const createSubtopic = (subtopicData) => async (dispatch) => {
    try {
        dispatch({ type: CREATE_SUBTOPIC_REQUEST });

        const { data } = await axios.post(`${server}/api/v2/create/subtopic`, subtopicData, {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true,
        });

        dispatch({
            type: CREATE_SUBTOPIC_SUCCESS,
            payload: data,
        });
    } catch (error) {
        dispatch({
            type: CREATE_SUBTOPIC_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};

export const getSubtopics = (subject, standard, chapter, topic) => async (dispatch) => {
    try {
        dispatch({ type: GET_SUBTOPICS_REQUEST });

        const { data } = await axios.get(
            `${server}/api/v2/get/subtopic?subjectName=${subject}&standard=${standard}&chapterName=${chapter}&topicName=${topic}`,
            {
                withCredentials: true,
            }
        );

        dispatch({
            type: GET_SUBTOPICS_SUCCESS,
            payload: data,
        });
    } catch (error) {
        dispatch({
            type: GET_SUBTOPICS_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const clearErrors = () => (dispatch) => {
    dispatch({ type: CLEAR_ERRORS });
};
