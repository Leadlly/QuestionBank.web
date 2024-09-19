// EditQuestionModal.jsx
import { Select } from 'antd';
import React, { useEffect, useState } from 'react';
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
    const [chapter, setChapter] = useState(selectedQuestion.chapter || '');
    const [topic, setTopic] = useState(selectedQuestion.topics || []);
    const [subtopic, setSubtopic] = useState(selectedQuestion.subtopics || []);
    const dispatch = useDispatch();
    const [error, setError] = useState('');
    const [level, setLevel] = useState(null);
    if (!isOpen) return null;
    useEffect(() => {
        if (standard) {
            dispatch(getSubjects(standard));
        }
        if (subject && standard) {
            dispatch(getChapters(subject, standard));
        }
    
        const fetchTopics = async () => {
            if (subject && standard && chapter.length > 0) {
                setError(''); // Clear any error if chapters are selected
                let allTopics = []; // To store all topics from selected chapters
                for (const chap of chapter) {
                    const response = await dispatch(getTopics(subject, standard, chap));
                    allTopics = [...allTopics, ...response.topics]; // Combine topics from all chapters
                }
                setTopic(allTopics); // Set the combined topics if different from current state
            } else if (subject && standard && chapter.length === 0) {
                setError('Chapter selection is required.');
            }
        };
    
        fetchTopics(); // Call the function to fetch topics
    
        if (subject && standard && chapter.length > 0 && topic) {
            dispatch(getSubtopics(subject, standard, chapter, topic));
        }
    }, [dispatch, standard, subject, chapter, topic, subtopic]);
    
    const handleSaveChanges = async () => {
        // Check if chapter is selected
        if (!chapter || chapter.length === 0) {
            setError('Chapter selection is required.');
            return; // Prevent form submission if chapter is not selected
        }
    
        // Create the updated question object after validation passes
        const updatedQuestion = {
            standard,
            subject,
            chapter,
            topics: topic,
            subtopics: subtopic,
            level
        };
    
        try {
            // Send the PUT request to update the question
            const response = await axios.put(`${server}/api/updatequestion/${selectedQuestion._id}`, updatedQuestion);
            const data = response.data;
    
            if (response.status === 200) {
                onSave(data.question);
                toast.success("Updated successfully");
                setIsModalOpen(false); // Close the modal after successful update
            } else {
                console.error('Failed to update question:', data.message);
                toast.error('Failed to update question: ' + data.message);
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
                        onChange={(value) => {
                            setChapter(value);
                            setTopic(null);
                            setSubtopic(null)
                        }}
                        options={chapterList?.map((chapter) => ({
                            value: chapter.name,
                            label: chapter.name,
                        }))}
                        value={chapter}
                        required
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
                        onChange={(value) => {
                            setTopic(value);
                        }}
                        options={topicList?.map((el) => ({
                            value: el.name,
                            label: el.name,
                        }))}
                        value={topic}
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
                        onChange={(value) => {
                            setSubtopic(value)
                        }}
                        options={subtopics.map((subtopic) => ({
                            value: subtopic.name,
                            label: subtopic.name,
                        }))}
                        value={subtopic}
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
