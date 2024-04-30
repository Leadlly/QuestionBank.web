import {
    CREATE_TOPIC_REQUEST,
    CREATE_TOPIC_SUCCESS,
    CREATE_TOPIC_FAIL,
    GET_TOPICS_REQUEST,
    GET_TOPICS_SUCCESS,
    GET_TOPICS_FAIL,
    CLEAR_ERRORS,
} from "../constants/topicConstants";

// Initial state for the create topic reducer
const initialState = {
    isLoading: false,
    success: false,
    error: null,
    topicList: [],
};

export const createTopicReducer = (state = initialState, action) => {
    switch (action.type) {
        case CREATE_TOPIC_REQUEST:
            return {
                ...state,
                isLoading: true,
            };

        case CREATE_TOPIC_SUCCESS:
            return {
                ...state,
                isLoading: false,
                success: true, 
                error: null,
            };

        case CREATE_TOPIC_FAIL:
            return {
                ...state,
                isLoading: false,
                success: false,
                error: action.payload, 
            };

        case CLEAR_ERRORS:
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
};

export const getTopicsReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_TOPICS_REQUEST:
            return {
                ...state,
                isLoading: true,
            };

        case GET_TOPICS_SUCCESS:
            return {
                ...state,
                isLoading: false,
                topicList: action.payload,
                error: null,
            };

        case GET_TOPICS_FAIL:
            return {
                ...state,
                isLoading: false,
                topicList: [],
                error: action.payload,
            };

        case CLEAR_ERRORS:
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
};