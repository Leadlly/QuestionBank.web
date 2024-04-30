import { createStore, combineReducers, applyMiddleware } from 'redux';
import {thunk} from 'redux-thunk'; 
import { composeWithDevTools } from '@redux-devtools/extension';
import { userReducer, userRegistrationReducer } from './reducers/userReducer';
import { createQuestionReducer } from './reducers/questionReducer';
import { createSubjectReducer, getSubjectReducer } from './reducers/subjectReducer';
import { createChapterReducer, getChaptersReducer } from './reducers/chapterReducer';
import { createTopicReducer, getTopicsReducer } from './reducers/topicReducer';
import { createSubtopicReducer, getSubtopicsReducer } from './reducers/subtopicReducer';


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
    getSubtopic: getSubtopicsReducer
  }),
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
