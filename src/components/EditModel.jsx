/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
// EditQuestionModal.jsx
import { Select } from 'antd';
import { useEffect, useState } from 'react';
import { getSubjects } from "../actions/subjectAction";
import { getChapters } from "../actions/chapterAction";
import { getTopics } from "../actions/topicAction";
import { getSubtopics } from "../actions/subtopicAction";
import { standards } from "./Options";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { server } from '../main';
import toast from 'react-hot-toast';


const EditModel = ({ isOpen, onClose, selectedQuestion, onSave, setIsModalOpen }) => {
    const { subjectList } = useSelector((state) => state.getSubject);
    const { chapterList } = useSelector((state) => state.getChapter);
    const { topicList } = useSelector((state) => state.getTopic);
    const { subtopics } = useSelector((state) => state.getSubtopic);
    const [standard, setStandard] = useState(selectedQuestion.standard || '');
    const [subject, setSubject] = useState(selectedQuestion.subject || '');
    const [chapter, setChapter] = useState(selectedQuestion?.chapter || []);
    const [topic, setTopic] = useState(selectedQuestion?.topics || []);
    const [subtopic, setSubtopic] = useState(selectedQuestion?.subtopics || []);
    const dispatch = useDispatch();
    const [error, setError] = useState('');
    const [level, setLevel] = useState(null);


    // const chapter = await getchpaterbyId(chapterId)
    // const selectedchapter = {
    //     name: chapter.name
    //     _id: chapater._id
    // }

    // setChapter(selectedchapter)

    if (!isOpen) return null;
    useEffect(() => {
        const fetchSubjects = async () => {
            if (standard) {
                await dispatch(getSubjects(standard));
            }
        };

        fetchSubjects();
    }, [dispatch, standard]);

    useEffect(() => {
        const fetchChapters = async () => {
            if (subject && standard) {
                await dispatch(getChapters(subject, standard));
            }
        };

        fetchChapters();
    }, [dispatch, subject, standard]);

    useEffect(() => {
        const fetchTopics = async () => {
            if (subject && standard && chapter.length > 0) {
                setError('');
                let allTopics = [];

                for (const chap of chapter) {
                    const response = await dispatch(getTopics(subject, standard, chap._id));

                    console.log('Response from getTopics:', response);

                    if (response && response.success) {
                        allTopics = [...allTopics, ...response.topics];
                    } else {
                        console.error('Failed to fetch topics:', response?.message);
                        setError('Failed to fetch topics.');
                    }
                }

                setTopic(allTopics); 
            } else if (subject && standard && chapter.length === 0) {
                setError('Chapter selection is required.');
            }
        };

        fetchTopics();
    }, [dispatch, subject, standard, chapter]);

    useEffect(() => {
        const fetchSubtopics = async () => {
            if (subject && standard && chapter.length > 0 && topic.length > 0) {
                const subtopicsResponse = await dispatch(
                    getSubtopics(
                        subject,
                        standard,
                        chapter.map(el => el._id), 
                        topic.map(el => el._id) 
                    )
                );

                console.log('Response from getSubtopics:', subtopicsResponse);

                if (subtopicsResponse && subtopicsResponse.success) {
                    setSubtopic(subtopicsResponse.subtopics);
                } else {
                    console.error('Failed to fetch subtopics:', subtopicsResponse?.message);
                    setError('Failed to fetch subtopics.');
                }
            }
        };

        fetchSubtopics();
    }, [dispatch, subject, standard, chapter, topic]);



    const handleSaveChanges = async () => {
        if (!chapter || chapter.length === 0) {
            setError('Chapter selection is required.');
            return;
        }

        try {
            const chapterId = chapter[0]?._id;
            const response = await axios.get(`${server}/api/get/chapter/${chapterId}`);

            if (response.data.success) {
                const fetchedChapter = response.data.chapter;
                const selectedChapter = {
                    name: fetchedChapter.name,
                    _id: fetchedChapter._id
                };

                const updatedQuestion = {
                    standard,
                    subject,
                    chapter: [selectedChapter],
                    topics: topic,
                    subtopics: subtopic,
                    level
                };

                const updateResponse = await axios.put(`${server}/api/updatequestion/${selectedQuestion._id}`, updatedQuestion);
                const data = updateResponse.data;

                if (updateResponse.status === 200) {
                    onSave(data.question);
                    toast.success("Updated successfully");
                    setIsModalOpen(false);
                } else {
                    console.error('Failed to update question:', data.message);
                    toast.error('Failed to update question: ' + data.message);
                }
            } else {
                console.error('Failed to fetch chapter:', response.data.message);
                toast.error('Failed to fetch chapter: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error updating question:', error);
            toast.error('Error updating question: ' + error.message);
        }
    };





    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            id="modalOverlay"
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-white rounded-lg shadow-lg p-6 w-11/12 sm:w-2/3 md:w-1/2 lg:w-1/3 xl:w-1/4 text-gray-900"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-xl mb-4">Edit Details</h3>

                <div className="relative z-0 w-full md:w-auto flex flex-col-reverse group">
                    <Select
                        showSearch
                        style={{ width: 200 }}
                        placeholder="Select Standard"
                        onChange={(value) => {
                            setStandard(value);
                            setSubject(null);
                            setChapter(null);
                            setTopic(null);
                            setSubtopic(null)
                        }}
                        options={standards}
                        value={standard}
                    />
                    <label className="text-white-500 text-sm dark:text-white-400 mt-1">
                        Standard
                    </label>
                </div>

                <div className="relative z-0 w-full md:w-auto flex flex-col-reverse group">
                    <Select
                        showSearch
                        style={{ width: 200 }}
                        placeholder="Select Subject"
                        filterOption={(input, option) =>
                            (option.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        onChange={(value) => {
                            setSubject(value);
                            setChapter(null);
                            setTopic(null);
                            setSubtopic(null)
                        }}
                        options={subjectList?.map((name) => ({
                            value: name,
                            label: name,
                        }))}
                        value={subject}
                    />
                    <label className="text-white-500 text-sm dark:text-white-400 mt-1">
                        Subject
                    </label>
                </div>
                <div className="relative z-0 w-full md:w-auto flex flex-col-reverse group">
                    <Select
                        mode="multiple"
                        showSearch
                        style={{ width: 200 }}
                        placeholder="Select Chapter"
                        filterOption={(input, option) =>
                            (option.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        onChange={(values, options) => {
                            const selectedChapters = options.map(option => ({
                                _id: option.value,
                                name: option.label,
                            }));
                            setChapter(selectedChapters);
                            setTopic(null);
                            setSubtopic(null);
                        }}
                        options={chapterList?.map(chapter => ({
                            value: chapter._id,
                            label: chapter.name,
                        }))}
                        value={chapter?.map(chap => ({ value: chap._id, label: chap.name }))}
                        labelInValue
                    />

                    <label className="text-white-500 text-sm dark:text-white-400 mt-1">
                        Chapter
                    </label>
                    {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
                </div>

                <div className="relative z-0 w-full md:w-auto flex flex-col-reverse group">
                    <Select
                        mode="multiple"
                        showSearch
                        style={{ width: 200 }}
                        placeholder="Select Topics"
                        filterOption={(input, option) =>
                            (option.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        onChange={(values, options) => {
                            const selectedTopics = options.map(option => ({
                                _id: option.value,
                                name: option.label,
                            }));
                            setTopic(selectedTopics);
                        }}
                        options={topicList?.map((el) => ({
                            value: el._id, 
                            label: el.name,
                        }))}
                        value={topic?.map(el => ({ value: el._id, label: el.name }))}
                        labelInValue
                    />
                    <label className="text-white-500 text-sm dark:text-white-400">
                        Topic
                    </label>
                </div>
                <div className="relative z-0 w-full md:w-auto flex flex-col-reverse group">
                    <Select
                        mode="multiple"
                        showSearch
                        style={{ width: 200 }}
                        placeholder="Select Subtopic"
                        filterOption={(input, option) =>
                            (option.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        options={subtopics?.map((subtopic) => ({
                            value: subtopic._id, 
                            label: subtopic.name,
                        }))}
                        onChange={(values, options) => {
                            const selectedSubtopics = options.map(option => ({
                                _id: option.value, 
                                name: option.label,
                            }));
                            setSubtopic(selectedSubtopics);
                        }}
                        value={subtopic?.map(el => ({ value: el._id, label: el.name }))} 
                        labelInValue
                    />

                    <label className="text-white-500 text-sm dark:text-white-400">
                        Subtopic
                    </label>

                </div>
                <div className="relative z-0 w-full mb-8 group flex flex-col-reverse">
                    <Select
                        showSearch
                        style={{ width: 200 }}
                        placeholder="Select Level"
                        filterOption={(input, option) =>
                            (option.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        onChange={(value) => setLevel(value)}
                        value={level}
                        options={[
                            { value: "boards", label: "Boards" },
                            { value: "neet", label: "Neet" },
                            { value: "jeemains_easy", label: "JeeMains_Easy" },
                            { value: "jeemains", label: "JeeMains" },
                            { value: "jeeadvance", label: "JeeAdvance" },
                        ]}
                    />
                    <label className="text-white-500 text-sm dark:text-white-400">
                        Level
                    </label>
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                        onClick={handleSaveChanges}
                    >
                        Save
                    </button>
                    <button
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditModel;
