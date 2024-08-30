import {
    CREATE_TOPIC_REQUEST,
    CREATE_TOPIC_SUCCESS,
    CREATE_TOPIC_FAIL,
    GET_TOPICS_REQUEST,
    GET_TOPICS_SUCCESS,
    GET_TOPICS_FAIL,
    CLEAR_ERRORS,
} from "../constants/topicConstants";
import axios from "axios";
import { server } from "../main";

export const createTopic = (topicData) => async (dispatch) => {
    try {
        dispatch({ type: CREATE_TOPIC_REQUEST });

        const response = await axios.post(`${server}/api/create/topic`, topicData, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });

        const data = response.data;

        dispatch({
            type: CREATE_TOPIC_SUCCESS,
            payload: data,
        });

        return data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;

        dispatch({
            type: CREATE_TOPIC_FAIL,
            payload: errorMessage,
        });

        return Promise.reject(errorMessage);
    }
};

export const getTopics = (subjectName, standard, chapterNames) => async (dispatch) => {
    try {
        dispatch({ type: GET_TOPICS_REQUEST });

        // Ensure chapterNames is properly formatted as a comma-separated string
        const chapters = Array.isArray(chapterNames) ? chapterNames.join(',') : chapterNames;

        // Make API call to get topics
        const { data } = await axios.get(`${server}/api/get/topic`, {
            params: {
                subjectName,
                standard,
                chapterName: chapters,
            },
            withCredentials: true, // Include credentials if needed
        });

        dispatch({
            type: GET_TOPICS_SUCCESS,
            payload: data.topics,
        });
    } catch (error) {
        console.error('Error fetching topics:', error); // Log the error for debugging

        dispatch({
            type: GET_TOPICS_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const clearErrors = () => (dispatch) => {
    dispatch({ type: CLEAR_ERRORS });
};
