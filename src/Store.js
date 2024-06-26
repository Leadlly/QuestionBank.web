import { createStore, combineReducers, applyMiddleware } from 'redux';
import {thunk} from 'redux-thunk'; 
import { composeWithDevTools } from '@redux-devtools/extension';
import { userQuestionsReducer, userReducer, userRegistrationReducer, verifyUserReducer } from './reducers/userReducer';
import { createQuestionReducer, deleteQuestionReducer, editQuestionReducer } from './reducers/questionReducer';
import { createSubjectReducer, getSubjectReducer } from './reducers/subjectReducer';
import { createChapterReducer, getChaptersReducer } from './reducers/chapterReducer';
import { createTopicReducer, getTopicsReducer } from './reducers/topicReducer';
import { createSubtopicReducer, getSubtopicsReducer, nestedSubtopicReducer } from './reducers/subtopicReducer';


const middleware = [thunk];
const store = createStore(
  combineReducers({
    user: userReducer,
    register:userRegistrationReducer,
    question: createQuestionReducer,
    createSubject: createSubjectReducer,
    chapter: createChapterReducer,
    topic: createTopicReducer,
    subtopic: createSubtopicReducer,
    getSubject: getSubjectReducer,
    getChapter: getChaptersReducer,
    getTopic: getTopicsReducer,
    getSubtopic: getSubtopicsReducer,
    delete: deleteQuestionReducer,
    userquestion: userQuestionsReducer,
    nestedsubtopic:nestedSubtopicReducer,
    verification: verifyUserReducer,
    editQuestion: editQuestionReducer,
  }),
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
