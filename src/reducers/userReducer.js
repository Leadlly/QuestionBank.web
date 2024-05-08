import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    PROFILE_REQUEST,
    PROFILE_SUCCESS,
    PROFILE_FAIL,
    LOGOUT_SUCCESS,
    LOGOUT_FAIL,
    REGISTER_REQUEST,
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    CLEAR_ERRORS,
    FETCH_USER_QUESTIONS,
    FETCH_USER_QUESTIONS_SUCCESS,
    FETCH_USER_QUESTIONS_FAILURE,
} from "../constants/userConstants";

const initialState = {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    success: false,
    error: null,
    questions: []
};

export const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN_REQUEST:
        case PROFILE_REQUEST:
            return {
                ...state,
                isLoading: true,
            };
        case LOGIN_SUCCESS:
        case PROFILE_SUCCESS:
            return {
                ...state,
                isLoading: false,
                isAuthenticated: true,
                user: action.payload,
                error: null,
            };
        case LOGIN_FAIL:
        case PROFILE_FAIL:
            return {
                ...state,
                isLoading: false,
                isAuthenticated: false,
                user: null,
                error: action.payload,
            };
        case LOGOUT_SUCCESS:
            return {
                ...state,
                isAuthenticated: false,
                user: null,
            };
        case LOGOUT_FAIL:
            return {
                ...state,
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
export const userRegistrationReducer = (state = initialState, action) => {
    switch (action.type) {
        case REGISTER_REQUEST:
            return {
                ...state,
                isLoading: true,
            };

        case REGISTER_SUCCESS:
            return {
                ...state,
                isLoading: false,
                user: action.payload.user,
                success: true,
                error: null,
            };

        case REGISTER_FAIL:
            return {
                ...state,
                isLoading: false,
                user: null,
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

export const userQuestionsReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_USER_QUESTIONS:
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case FETCH_USER_QUESTIONS_SUCCESS:
            return {
                ...state,
                isLoading: false,
                questions: action.payload,
                error: null,
            };
        case FETCH_USER_QUESTIONS_FAILURE:
            return {
                ...state,
                isLoading: false,
                questions: [],
                error: action.payload,
            };
        default:
            return state;
    }
};
