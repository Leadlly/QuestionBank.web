// EditQuestionModal.jsx
import { Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { getSubjects } from "../actions/subjectAction";
import { getChapters } from "../actions/chapterAction";
import { getTopics } from "../actions/topicAction";
import { getSubtopics } from "../actions/subtopicAction";
import { standards } from "./Options";
import { useDispatch, useSelector } from 'react-redux';

const EditModel = ({ isOpen, onClose, selectedQuestion, onSave }) => {
    const { subjectList } = useSelector((state) => state.getSubject);
    const { chapterList } = useSelector((state) => state.getChapter);
    const { topicList } = useSelector((state) => state.getTopic);
    const { subtopics } = useSelector((state) => state.getSubtopic);
    const [standard, setStandard] = useState(selectedQuestion.standard || '');
    const [subject, setSubject] = useState(selectedQuestion.subject || '');
    const [chapter, setChapter] = useState(selectedQuestion.chapter || '');
    const [topic, setTopic] = useState(selectedQuestion.topics || []);
    const [subtopic, setSubtopic] = useState(selectedQuestion.subtopics || []);
    const dispatch = useDispatch()
    if (!isOpen) return null;
    useEffect(() => {
        if (standard) {
            dispatch(getSubjects(standard));
        }
        if (subject && standard) {
            dispatch(getChapters(subject, standard));
        }
        if (subject && standard && chapter) {
            dispatch(getTopics(subject, standard, chapter));
        }
        if (subject && standard && chapter && topic) {
            dispatch(getSubtopics(subject, standard, chapter, topic))

        }
    }, [dispatch, standard, subject,])
    const handleSaveChanges = () => {
        onSave({
            ...selectedQuestion,
            standard,
            subject,
            chapter,
            topics: topic,
            subtopics: subtopic,
        });
        onClose();
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
                onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
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
                    />
                    <label className="text-white-500 text-sm dark:text-white-400 mt-1">
                        Chapter
                    </label>
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
