import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Select } from "antd";
import { standards } from "../components/Options";
import { useDispatch, useSelector } from "react-redux";
import { createChapter } from "../actions/chapterAction";
import { getSubjects } from "../actions/subjectAction";

const CreateChapter = () => {
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.chapter);
    const { subjectList } = useSelector((state) => state.getSubject);

    const [standard, setStandard] = useState("");
    const [subject, setSubject] = useState("");
    const [chapters, setChapters] = useState([{ name: "" }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (standard) {
            dispatch(getSubjects(standard));
        }
    }, [standard, dispatch]);

    const handleFormSubmit = async (event) => {
        event.preventDefault();
    
        if (isSubmitting) return;  
        
        setIsSubmitting(true);  
    
        const formattedData = {
            subject: {
                name: subject,
                chapters,
                standard: standard,  
            },
        };
    
        try {
            const result = await dispatch(createChapter(formattedData));
    
            if (result.success) {
                toast.success('Chapter added successfully!');
                setChapters([{ name: '' }]);  
            } else {
                const errorMessage = result?.message || 'Failed to add chapter.';
                toast.error(errorMessage);
            }
        } catch (error) {
            toast.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    

    const handleChapterChange = (index, value) => {
        const updatedChapters = [...chapters];
        updatedChapters[index].name = value;
        setChapters(updatedChapters);
    };

    const handleAddChapter = () => {
        const lastChapter = chapters[chapters.length - 1];
        if (lastChapter.name.trim()) {
            setChapters([...chapters, { name: "" }]);
        } else {
            toast.error("Please enter a chapter name before adding a new one.");
        }
    };

    return (
        <main className="p-4">
            <h1 className="text-center m-10 text-white-600">Create Chapter</h1>
            <form className="max-w-md mx-auto" onSubmit={handleFormSubmit}>
                <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
                    <Select
                        showSearch
                        style={{ width: 200 }}
                        placeholder="Select Standard"
                        value={standard}
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
                        value={subject}
                        onChange={(value) => setSubject(value)}
                        options={subjectList?.map((name) => ({ value: name, label: name }))}
                    />
                    <label className="text-white-500 text-sm dark:text-white-400">
                        Subject
                    </label>
                </div>

                <div className="relative z-0 w-full mb-5 group">
                    {chapters.map((chapter, index) => (
                        <div
                            key={`chapter-${index}`}
                            className="relative z-0 w-full mb-5 group flex flex-col-reverse"
                        >
                            <input
                                type="text"
                                name={`chapter-${index}`}
                                id={`chapter-${index}`}
                                className="block py-2.5 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-white-300 appearance-none dark:text-white dark:border-white-600 dark:focus:border-white-500 focus:outline-none focus:ring-0 focus:border-white-600 peer"
                                placeholder="Chapter name"
                                value={chapter.name}
                                onChange={(e) => handleChapterChange(index, e.target.value)}
                            />
                            <label
                                htmlFor={`chapter-${index}`}
                                className="peer-focus:font-medium absolute text-sm text-white-500 dark:text-white-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-white-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                            >
                                Chapter Name
                            </label>
                        </div>
                    ))}
                </div>

                <div
                    className="border text-white-600 mb-10 rounded-xl h-10 text-sm flex items-center justify-center cursor-pointer"
                    onClick={handleAddChapter}
                >
                    Add more chapters
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

export default CreateChapter;
