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
    const [topics, setTopics] = useState([{ name: "", topicNumber: "", subtopics: [] }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [chapterId, setChapterId] = useState("");

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

        if (!chapterId) {
            toast.error("Please select a valid chapter.");
            setIsSubmitting(false);
            return;
        }

        const topicNumbers = topics.map((topic, index) => topic.topicNumber || index + 1);
        const duplicateNumbers = topicNumbers.filter((num, index, self) => self.indexOf(num) !== index);

        if (duplicateNumbers.length > 0) {
            toast.error(`Duplicate topic numbers found: ${duplicateNumbers.join(", ")}`);
            setIsSubmitting(false);
            return;
        }

        const formattedTopics = topics.map((topic, index) => ({
            ...topic,
            topicNumber: topic.topicNumber || index + 1,
        }));

        const data = { standard, subjectName: subject, chapterName: chapter, chapterId, topics: formattedTopics };

        try {
            const result = await dispatch(createTopic(data));

            if (result.success) {
                toast.success("Topics added successfully!");
                setTopics([{ name: "", subtopics: [] }]);
            }
        } catch (error) {
            if (error?.message) {
                toast.error(error.message);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            setIsSubmitting(false);
        }

    };


    const handleTopicChange = (index, key, value) => {
        const updatedTopics = [...topics];
        updatedTopics[index][key] = value;
        setTopics(updatedTopics);
    };

    const handleAddTopic = () => {
        setTopics([...topics, { name: "", topicNumber: "", subtopics: [] }]);
    };

    return (
        <main className="p-4">
            <h1 className="text-center m-10 text-white-600">Create Topic</h1>
            <form className="max-w-md mx-auto" onSubmit={handleFormSubmit}>
                {/* Standard Selection */}
                <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
                    <Select
                        showSearch
                        style={{ width: 200 }}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            (option.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        onChange={(value) => setStandard(value)}
                        options={standards}
                    />
                    <label className="text-white-500 text-sm dark:text-white-400">Standard</label>
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
                        onChange={(value) => setSubject(value)}
                        value={subject}
                        options={subjectList?.map((name) => ({ value: name, label: name }))}
                    />
                    <label className="text-white-500 text-sm dark:text-white-400">Subject</label>
                </div>

                <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
                    <Select
                        showSearch
                        style={{ width: 200 }}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                        }
                        onChange={(value, option) => {
                            setChapter(option.label); 
                            setChapterId(option.key); 
                        }}
                        value={chapter}
                        options={chapterList?.map((chapter) => ({
                            value: chapter.name,
                            label: chapter.name,
                            key: chapter._id,
                        }))}
                    />
                    <label className="text-white-500 text-sm dark:text-white-400">Chapter</label>
                </div>

                <div className="relative z-0 w-full mb-5 group">
                    {topics.map((topic, index) => (
                        <div key={`topic-${index}`} className="relative z-0 w-full mb-5 group">
                            <div className="flex gap-4">
                                <input
                                    type="number"
                                    name={`topicNumber-${index}`}
                                    id={`topicNumber-${index}`}
                                    className="block py-2.5 px-2 w-20 text-sm bg-transparent border border-gray-300 rounded-lg"
                                    placeholder="Number"
                                    value={topic.topicNumber || 0}
                                    onChange={(e) =>
                                        setTopics((prevTopics) =>
                                            prevTopics.map((t, i) =>
                                                i === index ? { ...t, topicNumber: Math.max(0, Number(e.target.value)) } : t
                                            )
                                        )
                                    }
                                    min="0"
                                    required
                                />

                                <input
                                    type="text"
                                    name={`topicName-${index}`}
                                    id={`topicName-${index}`}
                                    className="block py-2.5 px-2 w-full text-sm bg-transparent border border-gray-300 rounded-lg"
                                    placeholder="Topic Name"
                                    value={topic.name}
                                    onChange={(e) =>
                                        setTopics((prevTopics) =>
                                            prevTopics.map((t, i) => (i === index ? { ...t, name: e.target.value } : t))
                                        )
                                    }
                                    required
                                />
                            </div>
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
                    className={`text-white bg-blue-${isSubmitting || isLoading ? "400" : "700"} hover:bg-blue-${isSubmitting || isLoading ? "500" : "800"
                        } focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800`}
                >
                    {isSubmitting || isLoading ? "Submitting..." : "Submit"}
                </button>
            </form>
        </main>
    );
};

export default CreateTopic;
