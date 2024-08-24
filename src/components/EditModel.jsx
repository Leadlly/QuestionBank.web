import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
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
    const [chapter, setChapter] = useState(selectedQuestion.chapter || []);
    const [topic, setTopic] = useState(selectedQuestion.topics || []);
    const [subtopic, setSubtopic] = useState(selectedQuestion.subtopics || []);
    const dispatch = useDispatch();
    const [error, setError] = useState('');

    useEffect(() => {
        if (standard) {
            dispatch(getSubjects(standard));
        }
        if (subject && standard) {
            dispatch(getChapters(subject, standard));
        }

        const fetchTopics = async () => {
            if (subject && standard && chapter.length > 0) {
                setError('');
                try {
                    // Fetch topics for all selected chapters in one go
                    const chapterNames = chapter.join(','); // Convert array to comma-separated string
                    const response = await dispatch(getTopics(subject, standard, chapterNames));

                    if (response && response.payload) {
                        setTopic(response.payload);
                    }
                } catch (error) {
                    console.error('Error fetching topics:', error);
                }
            } else if (subject && standard && chapter.length === 0) {
                setError('Chapter selection is required.');
            }
        };

        fetchTopics();

        if (subject && standard && chapter.length > 0 && topic.length > 0) {
            dispatch(getSubtopics(subject, standard, chapter, topic));
        }
    }, [dispatch, standard, subject, chapter, topic]); // Add `topic` to dependency array

    const handleSaveChanges = async () => {
        if (!chapter || chapter.length === 0) {
            setError('Chapter selection is required.');
            return;
        }

        const updatedQuestion = {
            standard,
            subject,
            chapter,
            topics: topic,
            subtopics: subtopic,
        };

        try {
            const response = await axios.put(`${server}/api/updatequestion/${selectedQuestion._id}`, updatedQuestion);
            const data = response.data;

            if (response.status === 200) {
                onSave(data.question);
                toast.success("Updated successfully");
                setIsModalOpen(false);
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

                {/* Standard Selector */}
                <div className="relative z-0 w-full md:w-auto flex flex-col-reverse group">
                    <Select
                        showSearch
                        style={{ width: 200 }}
                        placeholder="Select Standard"
                        onChange={(value) => {
                            setStandard(value);
                            setSubject(null);
                            setChapter([]);
                            setTopic([]);
                            setSubtopic([]);
                        }}
                        options={standards}
                        value={standard}
                    />
                    <label className="text-white-500 text-sm dark:text-white-400 mt-1">
                        Standard
                    </label>
                </div>

                {/* Subject Selector */}
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
                            setChapter([]);
                            setTopic([]);
                            setSubtopic([]);
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

                {/* Chapter Selector */}
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
                            setTopic([]);
                            setSubtopic([]);
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

                {/* Topic Selector */}
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
                            setSubtopic([]); // Clear subtopics when topics change
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

                {/* Subtopic Selector */}
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
                        options={subtopics && subtopics.map((subtopic) => ({
                            value: subtopic._id, // Ensure that `_id` is used as the value
                            label: subtopic.name,
                        }))}
                        value={subtopic}
                    />
                    <label className="text-white-500 text-sm dark:text-white-400">
                        Subtopic
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
