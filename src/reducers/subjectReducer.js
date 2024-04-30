import {
    CREATE_SUBJECT_REQUEST,
    CREATE_SUBJECT_SUCCESS,
    CREATE_SUBJECT_FAIL,
    GET_SUBJECTS_REQUEST,
    GET_SUBJECTS_SUCCESS,
    GET_SUBJECTS_FAIL,
    CLEAR_ERRORS,
} from "../constants/subjectConstants";

const initialState = {
    isLoading: false,
    subject: null,
    error: null,
    subjectList: [],
};

export const createSubjectReducer = (state = initialState, action) => {
    switch (action.type) {
        case CREATE_SUBJECT_REQUEST:
            return {
                ...state,
                isLoading: true,
            };

        case CREATE_SUBJECT_SUCCESS:
            return {
                ...state,
                isLoading: false,
                subject: action.payload.subject, 
                error: null,
            };

        case CREATE_SUBJECT_FAIL:
            return {
                ...state,
                isLoading: false,
                subject: null,
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

export const getSubjectReducer = (state = initialState, action) => {
    switch (action.type) {
      case GET_SUBJECTS_REQUEST:
        return {
          ...state,
          isLoading: true,
        };
  
      case GET_SUBJECTS_SUCCESS:
        return {
          ...state,
          isLoading: false,
          subjectList: action.payload.subjectList,
          error: null,
        };
  
      case GET_SUBJECTS_FAIL:
        return {
          ...state,
          isLoading: false,
          subjectList: [],
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
