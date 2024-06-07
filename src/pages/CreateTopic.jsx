import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Select } from "antd";
import { standards } from "../components/Options";
import { useDispatch, useSelector } from "react-redux";
import { createTopic } from "../actions/topicAction";
import { getSubjects } from "../actions/subjectAction";
import { getChapters } from "../actions/chapterAction";

const CreateTopic = () => {
    const [standard, setStandard] = useState("");
    const [subject, setSubject] = useState("");
    const [chapter, setChapter] = useState("");
    const [topics, setTopics] = useState([{ name: "", subtopics: [] }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.topic);
    const { subjectList } = useSelector((state) => state.getSubject);
    const { chapterList } = useSelector((state) => state.getChapter);

    useEffect(() => {
        if (standard) {
            dispatch(getSubjects(standard));
        }
        if (standard && subject) {
            dispatch(getChapters(subject, standard));
        }
    }, [standard, subject, dispatch]);

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);

        const formattedTopics = topics
            .map((topic) => {
                if (typeof topic.name !== 'string' || topic.name.trim() === '') {
                    console.error(`Invalid topic name: ${topic.name}`);
                    return null;
                }
                return {
                    name: topic.name.trim(),
                    subtopics: Array.isArray(topic.subtopics) ? topic.subtopics : [],
                };
            })
            .filter(topic => topic !== null);

        if (formattedTopics.length === 0) {
            toast.error("Please provide at least one valid topic.");
            setIsSubmitting(false);
            return;
        }

        const formattedData = {
            standard: standard,
            subjectName: subject,
            chapterName: chapter,
            topics: formattedTopics,
        };

        try {
            const result = await dispatch(createTopic(formattedData));

            if (result && result.success) {
                toast.success("Topics added successfully!");
                setTopics([{ name: "" }]);
            } else {
                const errorMessage = result?.message || "Failed to add topics. Please try again.";
                toast.error(errorMessage);
            }
        } catch (error) {
            toast.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTopicChange = (index, newName) => {
        const updatedTopics = [...topics];
        updatedTopics[index].name = newName;
        setTopics(updatedTopics);
    };

    const handleAddTopic = () => {
        setTopics([...topics, { name: "", subtopics: [] }]);
    };

    return (
        <main className="p-4">
            <h1 className="text-center m-10 text-white-600">Create Topic</h1>
            <form className="max-w-md mx-auto" onSubmit={handleFormSubmit}>
                <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
                    <Select
                        showSearch
                        style={{ width: 200 }}
                        placeholder="Select Standard"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            (option.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        onChange={(value) => setStandard(value)}
                        options={standards}
                    />
                    <label className="text-white-500 text-sm dark:text-white-400">
                        Standard
                    </label>
                </div>

                <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
                    <Select
                        showSearch
                        style={{ width: 200 }}
                        placeholder="Select Subject"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                        }
                        filterSort={(optionA, optionB) =>
                            optionA.label.toLowerCase().localeCompare(optionB.label.toLowerCase())
                        }
                        onChange={(value) => setSubject(value)}
                        value={subject}
                        options={subjectList?.map((name) => ({ value: name, label: name }))}
                    />
                    <label className="text-white-500 text-sm dark:text-white-400">
                        Subject
                    </label>
                </div>

                <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
                    <Select
                        showSearch
                        style={{ width: 200 }}
                        placeholder="Select Chapter"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                        }
                        filterSort={(optionA, optionB) =>
                            optionA.label.toLowerCase().localeCompare(optionB.label.toLowerCase())
                        }
                        onChange={(value) => setChapter(value)}
                        value={chapter}
                        options={chapterList?.map((chapter) => ({
                            value: chapter.name,
                            label: chapter.name,
                            key: chapter._id,
                        }))}
                    />
                    <label className="text-white-500 text-sm dark:text-white-400">
                        Chapter
                    </label>
                </div>

                <div className="relative z-0 w-full mb-5 group">
                    {topics.map((topic, index) => (
                        <div key={`topic-${index}`} className="relative z-0 w-full mb-5 group flex flex-col-reverse">
                            <input
                                type="text"
                                name={`topic-${index}`}
                                id={`topic-${index}`}
                                className="block py-2.5 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-white-300 appearance-none dark:text-white dark:border-white-600 dark:focus:border-white-500 focus:outline-none focus:ring-0 focus:border-white-600 peer"
                                placeholder=" "
                                value={topic.name}
                                onChange={(e) => handleTopicChange(index, e.target.value)}
                                required
                            />
                            <label
                                htmlFor={`topic-${index}`}
                                className="peer-focus:font-medium absolute text-sm text-white-500 dark:text-white-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-white-600 peer-focus:dark:text-white-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                            >
                                Add Topic
                            </label>
                        </div>
                    ))}
                </div>

                <div
                    className="border mb-10 rounded-xl h-10 text-sm flex items-center justify-center cursor-pointer"
                    onClick={handleAddTopic}
                >
                    Add more topics
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className={`text-white bg-blue-${isSubmitting || isLoading ? '400' : '700'} hover:bg-blue-${isSubmitting || isLoading ? '500' : '800'} focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800`}
                >
                    {isSubmitting || isLoading ? "Submitting..." : "Submit"}
                </button>
            </form>
        </main>
    );
};

export default CreateTopic;
