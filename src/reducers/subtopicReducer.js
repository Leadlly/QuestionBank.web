import {
    CREATE_SUBTOPIC_REQUEST,
    CREATE_SUBTOPIC_SUCCESS,
    CREATE_SUBTOPIC_FAIL,
    GET_SUBTOPICS_REQUEST,
    GET_SUBTOPICS_SUCCESS,
    GET_SUBTOPICS_FAIL,
    CLEAR_ERRORS,
} from "../constants/subtopicConstants";

const initialState = {
    isLoading: false,
    success: false,
    error: null,
    subtopics:[],
};

export const createSubtopicReducer = (state = initialState, action) => {
    switch (action.type) {
        case CREATE_SUBTOPIC_REQUEST:
            return {
                ...state,
                isLoading: true,
            };

        case CREATE_SUBTOPIC_SUCCESS:
            return {
                ...state,
                isLoading: false,
                success: true,
                error: null,
            };

        case CREATE_SUBTOPIC_FAIL:
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

export const getSubtopicsReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_SUBTOPICS_REQUEST:
            return {
                ...state,
                isLoading: true,
            };

        case GET_SUBTOPICS_SUCCESS:
            return {
                ...state,
                isLoading: false,
                subtopics: action.payload.subtopics,
                error: null,
            };

        case GET_SUBTOPICS_FAIL:
            return {
                ...state,
                isLoading: false,
                subtopics: [],
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