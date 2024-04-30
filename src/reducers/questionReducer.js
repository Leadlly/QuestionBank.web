import {
    CREATE_QUESTION_REQUEST,
    CREATE_QUESTION_SUCCESS,
    CREATE_QUESTION_FAIL,
    CLEAR_ERRORS,
} from "../constants/questionConstants";

const initialState = {
    isLoading: false,
    question: null,
    error: null,
};

export const createQuestionReducer = (state = initialState, action) => {
    switch (action.type) {
        case CREATE_QUESTION_REQUEST:
            return {
                ...state,
                isLoading: true,
            };

        case CREATE_QUESTION_SUCCESS:
            return {
                ...state,
                isLoading: false,
                question: action.payload.question, 
                error: null,
            };

        case CREATE_QUESTION_FAIL:
            return {
                ...state,
                isLoading: false,
                question: null, 
                error: action.payload, 
            };

        // Action case: Clear errors
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
};
