import {
    CREATE_CHAPTER_REQUEST,
    CREATE_CHAPTER_SUCCESS,
    CREATE_CHAPTER_FAIL,
    GET_CHAPTERS_REQUEST,
    GET_CHAPTERS_SUCCESS,
    GET_CHAPTERS_FAIL,
    CLEAR_ERRORS,
} from "../constants/chapterConstants";

const initialState = {
    isLoading: false,
    success: false,
    error: null,
    chapterList: [],
};

export const createChapterReducer = (state = initialState, action) => {
    switch (action.type) {
        case CREATE_CHAPTER_REQUEST:
            return {
                ...state,
                isLoading: true,
            };

        case CREATE_CHAPTER_SUCCESS:
            return {
                ...state,
                isLoading: false,
                success: true, 
                error: null,
            };

        case CREATE_CHAPTER_FAIL:
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

export const getChaptersReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_CHAPTERS_REQUEST:
            return {
                ...state,
                isLoading: true,
            };

        case GET_CHAPTERS_SUCCESS:
            return {
                ...state,
                isLoading: false,
                chapterList: action.payload,
                error: null,
            };

        case GET_CHAPTERS_FAIL:
            return {
                ...state,
                isLoading: false,
                chapterList: [],
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
