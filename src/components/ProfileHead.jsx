import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Tab } from '@headlessui/react';
import axios from 'axios';
import classNames from 'classnames';
import { server } from '../main';
import toast from 'react-hot-toast';
import { standards } from '../components/Options';

const ProfileHead = ({ setSelectedQuestion }) => {
    const [questions, setQuestions] = useState([]);
    const [myQuestions, setMyQuestions] = useState([]);
    const [selectedStandard, setSelectedStandard] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [mySubjects, setMySubjects] = useState([]);

    const resetInputData = () => {
        setSelectedStandard('');
        setSelectedSubject('');
    };

    const resetTabPanelData = () => {
        setQuestions([]);
        setMyQuestions([]);
    };

    const fetchQuestionsAndSubjects = async (standard) => {
      try {
           setSubjects([]);
  
           const response = await axios.get(`${server}/api/get/question?standard=${standard}`, {
              withCredentials: true,
          });
  
          const data = response.data;
  
          if (data.success && data.questions) {
              setQuestions(data.questions);
  
              const subjectsSet = new Set(data.questions.map(question => question.subject));
              const uniqueSubjects = Array.from(subjectsSet);
  
              setSubjects(uniqueSubjects);
  
              setSelectedSubject('');
          } else {
              setQuestions([]);
              setSubjects([]);
              setSelectedSubject('');
          }
      } catch (error) {
          toast.error(`No subjects available for selected ${standard}th standard`);
      }
  };
  

    const fetchUserQuestions = async (standard) => {
      try {
          const response = await axios.get(`${server}/api/user/myquestion?standard=${standard}`, {
              withCredentials: true,
          });
  
          const data = response.data;
  
          if (data.success && data.questions) {
             setMyQuestions(data.questions);
  
               const relevantQuestions = data.questions.filter(question => question.standard === standard);
              const subjectsSet = new Set(relevantQuestions.map(question => question.subject));
              const uniqueSubjects = Array.from(subjectsSet);
  
              setMySubjects(uniqueSubjects);
  
               setSelectedSubject('');
          } else {
              setMyQuestions([]);
              setMySubjects([]);
          }
      } catch (error) {
          toast.error(`No subjects available for selected ${standard}th standard`);
      }
  };
  

    useEffect(() => {
        if (selectedStandard) {
            fetchQuestionsAndSubjects(selectedStandard);
            fetchUserQuestions(selectedStandard);
        } else {
            setSubjects([]);
            setMySubjects([]);
            setSelectedSubject('');
        }
    }, [selectedStandard]);

    const handleTabChange = (index) => {
        resetInputData();
        resetTabPanelData();
        setSelectedQuestion(null)

        if (index === 0 && selectedStandard) {
            fetchQuestionsAndSubjects(selectedStandard);
        } else if (index === 1 && selectedStandard) {
            fetchUserQuestions(selectedStandard);
        }
    };

    const filteredQuestions = selectedSubject
        ? questions.filter(question => question.subject === selectedSubject)
        : questions;

   const filteredMyQuestions = selectedSubject
        ? myQuestions.filter(question => question.subject === selectedSubject)
        : myQuestions;

     const handleQuestionClick = (question) => {
        setSelectedQuestion(question);
    };

    return (
        <div className="w-full max-w-md px-2 py-4 sm:px-2">
            <div className="mb-4">
                <label htmlFor="standard-select" className="block text-sm cursor-pointer font-medium text-gray-900 mb-2">
                    Select a Standard:
                </label>
                <select
                    id="standard-select"
                    value={selectedStandard}
                    onChange={(e) => setSelectedStandard(e.target.value)}
                    className="block w-full p-2 border cursor-pointer text-gray-900 border-gray-300 rounded-md shadow-sm"
                >
                    <option value="" disabled className="cursor-pointer">
                        Select Standard
                    </option>
                    {standards.map((standard, index) => (
                        <option key={index} value={standard.value} className="cursor-pointer">
                            {standard.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label htmlFor="subject-select" className="block cursor-pointer text-sm font-medium text-gray-900 mb-2">
                    Select a Subject:
                </label>
                <select
                    id="subject-select"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="block w-full p-2 cursor-pointer border text-gray-900 border-gray-300 rounded-md shadow-sm"
                >
                    <option value="" className="cursor-pointer">
                        Select Subject
                    </option>
                    {(mySubjects.length > 0 ? mySubjects : subjects).map((subject, index) => (
                        <option key={index} value={subject} className="cursor-pointer">
                            {subject}
                        </option>
                    ))}
                </select>
            </div>

            <Tab.Group onChange={handleTabChange}>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                    <Tab
                        className={({ selected }) =>
                            classNames(
                                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                                'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                selected ? 'bg-white text-blue-700 shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-black'
                            )
                        }
                    >
                        All Questions
                    </Tab>

                    <Tab
                        className={({ selected }) =>
                            classNames(
                                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                                'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                selected ? 'bg-white text-blue-700 shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-black'
                            )
                        }
                    >
                        My Questions
                    </Tab>
                </Tab.List>

                <Tab.Panels className="mt-2">
                    <Tab.Panel
                        className={classNames(
                            'rounded-xl bg-white p-3',
                            'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                        )}
                    >
                        {selectedSubject ? (
                            <ul>
                                {filteredQuestions && filteredQuestions.length > 0 ? (
                                    filteredQuestions.map((question, index) => (
                                        <li
                                            key={index}
                                            className="relative rounded-md p-3 hover:bg-gray-100"
                                            onClick={() => handleQuestionClick(question)}
                                        >
                                            <p className="text-sm font-medium cursor-pointer text-gray-900 leading-5">
                                                Q. {question.question}
                                            </p>
                                        </li>
                                    ))
                                ) : (
                                    <li className="relative cursor-pointer text-gray-900 rounded-md p-3">
                                        No questions available
                                    </li>
                                )}
                            </ul>
                        ) : (
                            <p className="text-gray-900">Please select a subject to view questions.</p>
                        )}
                    </Tab.Panel>

                     <Tab.Panel
                        className={classNames(
                            'rounded-xl bg-white p-3',
                            'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                        )}
                    >
                        {selectedSubject ? (
                            <ul>
                                {filteredMyQuestions && filteredMyQuestions.length > 0 ? (
                                    filteredMyQuestions.map((question, index) => (
                                        <li
                                            key={index}
                                            className="relative rounded-md p-3 hover:bg-gray-100"
                                            onClick={() => handleQuestionClick(question)}
                                        >
                                            <p className="text-sm font-medium cursor-pointer text-gray-900 leading-5">
                                                Q. {question.question}
                                            </p>
                                        </li>
                                    ))
                                ) : (
                                    <li className="relative cursor-pointer text-gray-900 rounded-md p-3">
                                        No questions available
                                    </li>
                                )}
                            </ul>
                        ) : (
                            <p className="text-gray-900">Please select a subject to view questions.</p>
                        )}
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
};

ProfileHead.propTypes = {
    setSelectedQuestion: PropTypes.func.isRequired,
};

export default ProfileHead;
