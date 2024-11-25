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
        const errorMessage = error.response?.data?.message || error.message || "An error occurred";

        dispatch({
            type: CREATE_TOPIC_FAIL,
            payload: errorMessage,
        });

        return Promise.reject({ message: errorMessage, status: error.response?.status });
    }
};


export const getTopics = (subjectName, standard, chapterId) => async (dispatch) => {
    try {
        dispatch({ type: GET_TOPICS_REQUEST });

        const { data } = await axios.get(
            `${server}/api/get/topic?subjectName=${subjectName}&standard=${standard}&chapterId=${chapterId}`,
            {
                withCredentials: true,
            }
        );

        dispatch({
            type: GET_TOPICS_SUCCESS,
            payload: data.topics,
        });
    } catch (error) {
        dispatch({
            type: GET_TOPICS_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const getTopicsByIds = async(topicIds) => {
    try {

        const { data } = await axios.post(`${server}/api/get/topics`, {topicIds}, {
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
