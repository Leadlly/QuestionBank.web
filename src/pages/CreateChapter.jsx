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
  const [chapters, setChapters] = useState([{ name: "", chapterNumber: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (standard) {
      dispatch(getSubjects(standard.trim())); 
    }
  }, [standard, dispatch]);
  
  const handleFormSubmit = async (event) => {
    event.preventDefault();
  
    if (isSubmitting) return;
  
    // Validate chapters array
    if (!chapters.length) {
      toast.error("Please add at least one chapter.");
      return;
    }
  
    const seenChapters = new Set();
    for (const chapter of chapters) {
      const uniqueKey = `${chapter.name.trim().toLowerCase()}-${chapter.chapterNumber}`;
      if (seenChapters.has(uniqueKey)) {
        toast.error("Chapter names and chapter numbers must be unique for the same subject and standard.");
        return;
      }
      seenChapters.add(uniqueKey);
    }
  
    // Validate standard and subject
    if (!standard || !standard.trim()) {
      toast.error("Please select a standard.");
      return;
    }
  
    if (!subject || !subject.trim()) {
      toast.error("Please select a subject.");
      return;
    }
  
    setIsSubmitting(true);
  
    const formattedData = {
      subject: {
        name: subject.trim(),
        standard: standard.trim(),
        chapters: chapters.map((chapter) => ({
          name: chapter.name.trim(),
          chapterNumber: parseInt(String(chapter.chapterNumber).trim(), 10),
          topics: chapter.topics || [],
        })),
      },
    };
  
    try {
      const result = await dispatch(createChapter(formattedData));
      if (result.success) {
        toast.success("Chapter added successfully!");
        setChapters([{ name: "", chapterNumber: "", topics: [] }]); 
      } else {
        toast.error(result.message || "Failed to add chapter.");
      }
    } catch (error) {
      console.error("Error adding chapter:", error);
      toast.error(error.message || "An error occurred while adding the chapter.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  
  const handleChapterChange = (index, field, value) => {
    const updatedChapters = [...chapters];
    updatedChapters[index][field] = field === "chapterNumber" ? Number(value) : value.trim();
    setChapters(updatedChapters);
  };
  
  const handleAddChapter = () => {
    const lastChapter = chapters[chapters.length - 1];
    if (lastChapter.name.trim() && lastChapter.chapterNumber !== "") {
      setChapters([...chapters, { name: "", chapterNumber: "" }]);
    } else {
      toast.error("Please complete the current chapter details before adding a new one.");
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
          <label className="text-white-500 text-sm dark:text-white-400">Standard</label>
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
          <label className="text-white-500 text-sm dark:text-white-400">Subject</label>
        </div>

        <div className="relative z-0 w-full mb-5 group">
        {chapters.map((chapter, index) => (
  <div key={`chapter-${index}`} className="relative z-0 w-full mb-5 group">
    <div className="flex gap-4">
      <input
        type="number"
        name={`chapterNumber-${index}`}
        id={`chapterNumber-${index}`}
        className="block py-2.5 px-2 w-20 text-sm bg-transparent border border-gray-300 rounded-lg"
        placeholder="Number"
        value={chapter.chapterNumber || 0}  
        onChange={(e) =>
          handleChapterChange(index, "chapterNumber", e.target.value)
        }
        min="0" 
        required
      />

      <input
        type="text"
        name={`chapterName-${index}`}
        id={`chapterName-${index}`}
        className="block py-2.5 px-2 w-full text-sm bg-transparent border border-gray-300 rounded-lg"
        placeholder="Chapter Name"
        value={chapter.name}
        onChange={(e) =>
          handleChapterChange(index, "name", e.target.value)
        }
        required
      />
    </div>
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
          className={`text-white bg-blue-${
            isSubmitting || isLoading ? "400" : "700"
          } hover:bg-blue-${
            isSubmitting || isLoading ? "500" : "800"
          } focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800`}
        >
          {isSubmitting || isLoading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </main>
  );
};

export default CreateChapter;
