import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Tab } from '@headlessui/react';
import axios from 'axios';
import classNames from 'classnames';
import { server } from '../main';
import toast from 'react-hot-toast';
import { standards } from '../components/Options';
import "../styles/login.scss";
import { useSelector } from 'react-redux';

const ProfileHead = ({ setSelectedQuestion }) => {
    const [questions, setQuestions] = useState([]);
    const [myQuestions, setMyQuestions] = useState([]);
    const [selectedStandard, setSelectedStandard] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [mySubjects, setMySubjects] = useState([]);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const { user } = useSelector((state) => state.user);

    const isAdmin = user?.role === "admin";

    useEffect(() => {
        // Fetch questions and subjects when selectedStandard changes or tab changes
        if (selectedStandard) {
            if (activeTabIndex === 0) {
                fetchQuestionsAndSubjects(selectedStandard);
                setSelectedQuestion(null);
            } else if (activeTabIndex === 1) {
                fetchUserQuestions(selectedStandard);
                setSelectedQuestion(null);
            }
        }
    }, [selectedStandard, activeTabIndex]);

    // Reset selectedSubject when selectedStandard changes
    useEffect(() => {
        setSelectedSubject('');
    }, [selectedStandard]);

    const fetchQuestionsAndSubjects = async (standard) => {
        try {
            const response = await axios.get(`${server}/api/get/question?standard=${standard}`, {
                withCredentials: true,
            });

            if (response.data.success) {
                const questions = response.data.questions;
                setQuestions(questions);

                const uniqueSubjects = Array.from(new Set(questions.map(q => q.subject)));
                setSubjects(uniqueSubjects);

                setSelectedSubject('');
            } else {
                setQuestions([]);
                setSubjects([]);
                toast.error(`No questions available for the selected standard.`);
            }
        } catch (error) {
            toast.error("Error fetching questions and subjects.");
            console.error(error);
        }
    };

    const fetchUserQuestions = async (standard) => {
        try {
            const response = await axios.get(`${server}/api/user/myquestion?standard=${standard}`, {
                withCredentials: true,
            });

            if (response.data.success) {
                const questions = response.data.questions;
                setMyQuestions(questions);

                const uniqueSubjects = Array.from(new Set(questions.map(q => q.subject)));
                setMySubjects(uniqueSubjects);

                setSelectedSubject('');
            } else {
                setMyQuestions([]);
                setMySubjects([]);
                toast.error(`No questions found for the selected standard.`);
            }
        } catch (error) {
            toast.error("Error fetching questions.");
            console.error(error);
        }
    };

    const handleTabChange = (index) => {
        setSelectedQuestion(null);
        setActiveTabIndex(index);
        setSelectedStandard('');
        setSelectedSubject('');
    
        // Fetch questions when clicking on the active tab
        if (selectedStandard) {
            if (index === 0) {
                fetchQuestionsAndSubjects(selectedStandard);
            } else if (index === 1) {
                fetchUserQuestions(selectedStandard);
            }
        }
    };
    
    

    // Set active tab index based on isAdmin status
    useEffect(() => {
        if (!isAdmin) {
            setActiveTabIndex(1); // Set to My Questions tab if not admin
        }
    }, [isAdmin]);

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
                <label htmlFor="standard-select" className="block text-sm font-medium text-gray-900 mb-2">
                    Select a Standard:
                </label>
                <select
                    id="standard-select"
                    value={selectedStandard}
                    onChange={(e) => setSelectedStandard(e.target.value)}
                    className="block w-full p-2 border text-gray-900 border-gray-300 rounded-md shadow-sm cursor-pointer"
                >
                    <option value="" disabled>
                        Select Standard
                    </option>
                    {standards.map((standard, index) => (
                        <option key={index} value={standard.value}>
                            {standard.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label htmlFor="subject-select" className="block text-sm font-medium text-gray-900 mb-2">
                    Select a Subject:
                </label>
                <select
                    id="subject-select"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="block w-full p-2 border text-gray-900 border-gray-300 rounded-md shadow-sm cursor-pointer"
                >
                    <option value="">
                        Select Subject
                    </option>
                    {activeTabIndex === 1 ? (
                        mySubjects.length > 0 ? (
                            mySubjects.map((subject, index) => (
                                <option key={index} value={subject}>
                                    {subject}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>
                                No subjects found.
                            </option>
                        )
                    ) : (
                        subjects.length > 0 ? (
                            subjects.map((subject, index) => (
                                <option key={index} value={subject}>
                                    {subject}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>
                                No subjects found.
                            </option>
                        )
                    )}
                </select>
            </div>

            <Tab.Group onChange={handleTabChange}>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                    {isAdmin && (
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
                    )}

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
            activeTabIndex === 0 ? (
                <ul>
                    {isAdmin ? (
                        filteredQuestions.length > 0 ? (
                            filteredQuestions.map((question, index) => (
                                <li
                                    key={index}
                                    className="relative rounded-md p-3 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleQuestionClick(question)}
                                >
                                    <p className="text-sm font-medium text-gray-900 leading-5">
                                        Q. {question.question}
                                    </p>
                                </li>
                            ))
                        ) : (
                            <li className="relative text-gray-900 rounded-md p-3">
                                No questions found.
                            </li>
                        )
                    ) : (
                        <li className="relative text-gray-900 rounded-md p-3">
                            Admin access required to view all questions.
                        </li>
                    )}
                </ul>
            ) : activeTabIndex === 1 ? (
                <ul>
                    {filteredMyQuestions.length > 0 ? (
                        filteredMyQuestions.map((question, index) => (
                            <li
                                key={index}
                                className="relative rounded-md p-3 hover:bg-gray-100"
                                onClick={() => handleQuestionClick(question)}
                            >
                                <p className="text-sm font-medium text-gray-900 leading-5 cursor-pointer">
                                    Q. {question.question}
                                </p>
                            </li>
                        ))
                    ) : (
                        <li className="relative text-gray-900 rounded-md p-3">
                            No questions available for the selected subject.
                        </li>
                    )}
                </ul>
            ) : null
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
            activeTabIndex === 0 ? (
                <ul>
                    {isAdmin ? (
                        filteredQuestions.length > 0 ? (
                            filteredQuestions.map((question, index) => (
                                <li
                                    key={index}
                                    className="relative rounded-md p-3 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleQuestionClick(question)}
                                >
                                    <p className="text-sm font-medium text-gray-900 leading-5">
                                        Q. {question.question}
                                    </p>
                                </li>
                            ))
                        ) : (
                            <li className="relative text-gray-900 rounded-md p-3">
                                No questions found.
                            </li>
                        )
                    ) : (
                        <li className="relative text-gray-900 rounded-md p-3">
                            Admin access required to view all questions.
                        </li>
                    )}
                </ul>
            ) : activeTabIndex === 1 ? (
                <ul>
                    {filteredMyQuestions.length > 0 ? (
                        filteredMyQuestions.map((question, index) => (
                            <li
                                key={index}
                                className="relative rounded-md p-3 hover:bg-gray-100"
                                onClick={() => handleQuestionClick(question)}
                            >
                                <p className="text-sm font-medium text-gray-900 leading-5 cursor-pointer">
                                    Q. {question.question}
                                </p>
                            </li>
                        ))
                    ) : (
                        <li className="relative text-gray-900 rounded-md p-3">
                            No questions available for the selected subject.
                        </li>
                    )}
                </ul>
            ) : null
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
