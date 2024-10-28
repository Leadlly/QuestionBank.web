import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select } from "antd";
import toast from "react-hot-toast";
import { createSubtopic } from "../actions/subtopicAction";
import { getSubjects } from "../actions/subjectAction";
import { getChapters } from "../actions/chapterAction";
import { getTopics } from "../actions/topicAction";
import { standards } from "../components/Options";
import PropTypes from "prop-types";

const CreateSubtopic = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.subtopic);
  const { subjectList } = useSelector((state) => state.getSubject);
  const { chapterList } = useSelector((state) => state.getChapter);
  const { topicList } = useSelector((state) => state.getTopic);

  const [standard, setStandard] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [topic, setTopic] = useState("");
  const [subtopics, setSubtopics] = useState([{ name: "", subtopics: [] }]);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedTopic , setSelectedTopic ] = useState('');
const [selectedChapterId, setSelectedChapterId] = useState(null);
const [selectedTopicId , setSelectedTopicId ] = useState(null);


  const inputRef = useRef(null);

  useEffect(() => {
    if (standard) {
      dispatch(getSubjects(standard));
    }
  }, [standard, dispatch]);
  
  useEffect(() => {
    if (subject && standard) {
      dispatch(getChapters(subject, standard));
    }
  }, [subject, standard, dispatch]);
  
  useEffect(() => {
    if (subject && standard && selectedChapterId) {
      dispatch(getTopics(subject, standard, selectedChapterId));
    }
  }, [subject, standard, selectedChapterId, dispatch]);
  
  

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    console.log("Subject:", subject);
    console.log("Standard:", standard);
    console.log("Chapter:", selectedChapter); // Use the selectedChapter state
    console.log("Topic:", selectedTopic); // Use the selectedTopic state
    console.log("Subtopics:", subtopics);
    
    // Validate if required fields are filled
    if (!subject || !standard || !selectedChapter || !selectedTopic) {
      toast.error("Please fill in all required fields.");
      return;
    }
  
    // Validate subtopics array - at least one valid subtopic name must be provided
    if (!subtopics || subtopics.length === 0 || !subtopics.some(sub => sub.name)) {
      toast.error("Please provide at least one valid subtopic name.");
      return;
    }
  
    const chapterId = selectedChapterId; 
    const topicId = selectedTopicId;     
  
    if (!chapterId || !topicId) {
      toast.error("Chapter or Topic ID is missing.");
      return;
    }
  
    const formattedData = {
      subjectName: subject,
      standard: standard,
      chapterName: selectedChapter, // Update to use selectedChapter
      topicName: selectedTopic, // Update to use selectedTopic
      chapterId,  
      topicId,    
      subtopics,  
    };
  
    try {
      const result = await dispatch(createSubtopic(formattedData));
      if (result && result.success) {
        toast.success("Subtopic added successfully!");
        setSubtopics([{ name: "", subtopics: [] }]);
      } else {
        const errorMessage = result?.message || "Failed to add subtopic. Please try again.";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error(error.message || "Subtopic already exists!");
    }
  };
  

  

  const handleSubtopicChange = (index, key, value) => {
    const updatedSubtopics = [...subtopics];
    const keys = key.split(".");

    let target = updatedSubtopics[index];
    for (let i = 0; i < keys.length - 1; i++) {
      target = target[keys[i]];
    }
    target[keys[keys.length - 1]] = value;

    setSubtopics(updatedSubtopics);

    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 0);
    }
  };

  const addSubtopic = () => {
    setSubtopics((prev) => [...prev, { name: "", subtopics: [] }]);
  };

  const addNestedSubtopic = (index) => {
    const updatedSubtopics = [...subtopics];
    const targetSubtopic = updatedSubtopics[index];
    targetSubtopic.subtopics.push({ name: "", subtopics: [] });
    setSubtopics(updatedSubtopics);
  };

  const SubtopicInput = ({ subtopic, index, nestedIndex, onChange, onAddNested }) => {
    const inputRef = useRef(null);
    const keyPrefix = nestedIndex !== undefined ? `${index}.subtopics.${nestedIndex}` : `${index}`;
  
    useEffect(() => {
      if (inputRef.current && nestedIndex === undefined) {
        inputRef.current.focus();
      }
    }, [nestedIndex]);
  
    return (
      <div className="relative z-0 w-full mb-5 group" key={keyPrefix}>
        <input
          type="text"
          ref={inputRef}
          name={`subtopic-${keyPrefix}`}
          id={`subtopic-${keyPrefix}`}
          className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-white-600 dark:focus:border-white-500 focus:outline-none focus:ring-0 focus:border-white-600 peer"
          placeholder={nestedIndex !== undefined ? "Nested Subtopic Name" : "Subtopic Name"}
          value={subtopic.name}
          onChange={(e) => onChange(index, nestedIndex !== undefined ? `subtopics.${nestedIndex}.name` : 'name', e.target.value)}
          required
        />
        {/* <button
          className="mt-8 p-4 border mb-10 rounded-xl h-10 text-sm flex items-center justify-center cursor-pointer"
          type="button"
          onClick={() => onAddNested(index)}
        >
          Add Nested Subtopic
        </button> */}
        {subtopic.subtopics.map((nestedSubtopic, nestedIdx) => (
          <div key={nestedIdx} style={{ marginLeft: "20px" }}>
            <SubtopicInput
              subtopic={nestedSubtopic}
              index={index}
              nestedIndex={nestedIdx}
              onChange={onChange}
              onAddNested={onAddNested}
            />
          </div>
        ))}
      </div>
    );
  };
  // When selecting a chapter
const handleChapterChange = (value) => {
  setSelectedChapter(value);
  const selectedChapter = chapterList.find((chapter) => chapter.name === value);
  if (selectedChapter) {
    setSelectedChapterId(selectedChapter._id); // Set the chapter ID
    console.log("Selected Chapter:", selectedChapter.name); // Debugging line
  }
};

// When selecting a topic
const handleTopicChange = (value) => {
  setSelectedTopic(value);
  const selectedTopic = topicList.find((topic) => topic.name === value);
  if (selectedTopic) {
    setSelectedTopicId(selectedTopic._id); // Set the topic ID
    console.log("Selected Topic:", selectedTopic.name); // Debugging line
  }
};


  SubtopicInput.propTypes = {
    subtopic: PropTypes.shape({
      name: PropTypes.string.isRequired,
      subtopics: PropTypes.arrayOf(PropTypes.object).isRequired,
    }).isRequired,
    index: PropTypes.number.isRequired,
    nestedIndex: PropTypes.number, // Add this line for nestedIndex validation
    onChange: PropTypes.func.isRequired,
    onAddNested: PropTypes.func.isRequired,
  };

  return (
    <main className="p-4">
      <h1 className="text-center m-10 text-white-600">Create Subtopics</h1>
      <form className="max-w-md mx-auto" onSubmit={handleFormSubmit}>
        <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select Standard"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? "").includes(input)
            }
            onChange={(value) => {
              setStandard(value);
              // getSubject(value);
            }}
            options={standards}
          />

          <label className=" text-white-500 text-sm dark:text-white-400 ">
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
            onChange={(value) => {
              setSubject(value);
              getChapters(value);
            }}
            value={subject}
            options={
              subjectList &&
              subjectList.map((name, index) => ({
                value: name,
                label: name,
                key: index,
              }))
            }
            required
          />

          <label
            htmlFor="subject"
            className=" text-white-500 text-sm dark:text-white-400 "
          >
            Subject
          </label>
        </div>
        <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
        <Select
  style={{ width: 200 }}
  showSearch
  placeholder="Select Chapter"
  optionFilterProp="children"
  filterOption={(input, option) =>
    option.label.toLowerCase().includes(input.toLowerCase())
  }
  onChange={handleChapterChange} // Use the handler here
  value={selectedChapter}
  options={chapterList?.map((chapter) => ({
    value: chapter.name,
    label: chapter.name,
  }))} 
/>






          <label
            htmlFor="chapter"
            className=" text-white-500 text-sm dark:text-white-400 "
          >
            Chapter
          </label>
        </div>
        <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
        <Select
  style={{ width: 200 }}
  showSearch
  placeholder="Select Topic"
  optionFilterProp="children"
  filterOption={(input, option) =>
    option.label.toLowerCase().includes(input.toLowerCase())
  }
  onChange={handleTopicChange} // Use the handler here
  value={selectedTopic}
  options={topicList?.map((topic) => ({
    value: topic.name,
    label: topic.name,
  }))} 
/>

          <label className=" text-white-500 text-sm dark:text-white-400 ">
            Topic
          </label>
        </div>
        {subtopics.map((subtopic, index) => (
          <SubtopicInput
            key={index}
            subtopic={subtopic}
            index={index}
            onChange={handleSubtopicChange}
            onAddNested={addNestedSubtopic}
          />
        ))}

        <div
          className="border mb-10 rounded-xl h-10 text-sm flex items-center justify-center cursor-pointer"
          onClick={addSubtopic}
        >
          Add More Subtopics
        </div>

        {isLoading ? (
          <button
            type="submit"
            disabled
            className="text-white bg-white-500 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            Submitting
          </button>
        ) : (
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-white-800"
          >
            Submit
          </button>
        )}
      </form>
    </main>
  );
};

export default CreateSubtopic;
