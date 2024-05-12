import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select } from "antd";
import toast from "react-hot-toast";
import { createQuestion } from "../actions/questionAction";
import { getSubjects } from "../actions/subjectAction";
import { getChapters } from "../actions/chapterAction";
import { getTopics } from "../actions/topicAction";
import { getSubtopics } from "../actions/subtopicAction";
import { standards } from "../components/Options";

const CreateQuestion = () => {
  const dispatch = useDispatch();

  const [standard, setStandard] = useState(null);
  const [subject, setSubject] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [topic, setTopic] = useState(null);
  const [level, setLevel] = useState(null);
  const [selectedSubtopics, setSelectedSubtopics] = useState([]);

  const [options, setOptions] = useState([""]);
  const [correctOptions, setCorrectOptions] = useState([""]);

  const { subjectList } = useSelector((state) => state.getSubject);
  const { chapterList } = useSelector((state) => state.getChapter);
  const { topicList } = useSelector((state) => state.getTopic);
  const { subtopics } = useSelector((state) => state.getSubtopic);
  const { isLoading: questionLoading } = useSelector((state) => state.question);

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
      dispatch(getSubtopics(subject, standard, chapter, topic));
    }
  }, [dispatch, standard, subject, chapter, topic]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {};
    for (const [name, value] of formData.entries()) {
      data[name] = value;
    }
    const filteredOptions = options.filter((option) => option.trim() !== "");
    const filteredCorrectOptions = correctOptions.filter(
      (option) => option.trim() !== ""
    );
  
// Frontend response modification
const formattedData = {
  question: data.question,
  options: {
    all: filteredOptions,
    correct: filteredCorrectOptions,
  },
  standard,
  subject,
  chapter,
  topic,
  subtopics: selectedSubtopics[0].name,
  level,
  nestedSubTopic: selectedSubtopics
  .filter(({ subtopics }) => subtopics && subtopics.length > 0)
  .flatMap(({ subtopics }) =>
    subtopics
      .filter(({ isSelected }) => isSelected)
      .map(({ name }) => name)
  )
  .join(', ')

};




  
    try {
      const response = await dispatch(createQuestion(formattedData));
  
      if (response.success) {
        toast.success("Question added successfully!");
        resetFormFields();
      } else {
        toast.error("Failed to create question. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to create question. Please try again.");
    }
  };
  
  

  const handleInputChange = (index, event) => {
    const newOptions = [...options];
    newOptions[index] = event.target.value;

    if (newOptions[index].trim() !== "" && newOptions.length < 4) {
      newOptions.push("");
    }

    setOptions(newOptions);
  };

  const handleSelectionChange = (index, event) => {
    const newCorrectOptions = [...correctOptions];
    newCorrectOptions[index] = event.target.value;
    setCorrectOptions(newCorrectOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const resetFormFields = () => {
    document.getElementById("question").value = "";
    setOptions([""]);
    setCorrectOptions([""]);
  };

  const handleSubtopicChange = (value, level) => {
    const updatedSubtopics = [...selectedSubtopics];
    const parentSubtopics = level === 0 ? subtopics : updatedSubtopics[level - 1].subtopics;
  
    const selectedSubtopic = parentSubtopics.find((sub) => sub.name === value);
  
    if (selectedSubtopic) {
      selectedSubtopic.isSelected = true; // Mark the selected subtopic as selected
      updatedSubtopics[level] = selectedSubtopic;
    }
  
    setSelectedSubtopics(updatedSubtopics.slice(0, level + 1));
  };
  

  const addCorrectOption = () => {
    if (correctOptions.length < options.length) {
      setCorrectOptions([...correctOptions, ""]);
    }
  };

  const renderSubtopicSelectors = (currentSubtopics, level) => {
    if (!currentSubtopics || currentSubtopics.length === 0) {
      return null;
    }

    const selectedSubtopic = selectedSubtopics[level] || null;

    return (
      <div key={level} className="relative z-0 w-full mb-0 group flex flex-col">
      <label
          htmlFor={`subtopic-select-${level}`}
          className="block text-sm dark:text-white-400"
      >
          Subtopic
      </label>
  
      <Select
          id={`subtopic-select-${level}`}
          showSearch
          style={{ width: 200 }}
          placeholder="Select Subtopic"
          options={currentSubtopics.map((subtopic) => ({
              value: subtopic.name,
              label: subtopic.name,
          }))}
          value={selectedSubtopic ? selectedSubtopic.name : null}
          onChange={(value) => handleSubtopicChange(value, level)}
      />
  
      {selectedSubtopic && selectedSubtopic.subtopics && (
          <div className="mt-5 mb-0">
              {renderSubtopicSelectors(selectedSubtopic.subtopics, level + 1)}
          </div>
      )}
  </div>
  
    );
  };

  return (
    <main className="p-4">
      <h1 className="text-center m-10 text-white-600">Create Questions</h1>
      <form className="max-w-md mx-auto" onSubmit={handleFormSubmit}>
        <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select Standard"
            onChange={(value) => setStandard(value)}
            options={standards}
            value={standard}
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
            onChange={(value) => setSubject(value)}
            options={subjectList?.map((name) => ({
              value: name,
              label: name,
            }))}
            value={subject}
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
            onChange={(value) => setChapter(value)}
            options={chapterList?.map((chapter) => ({
              value: chapter.name,
              label: chapter.name,
            }))}
            value={chapter}
          />
          <label className="text-white-500 text-sm dark:text-white-400">
            Chapter
          </label>
        </div>

        <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select Topic"
            onChange={(value) => setTopic(value)}
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

        {topic && subtopics && subtopics.length > 0 && (
          <div>{renderSubtopicSelectors(subtopics, 0)}</div>
        )}

        <div className="relative z-0 w-full mt-2 mb-5 group flex flex-col-reverse">
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select Level"
            onChange={(value) => setLevel(value)}
            value={level}
            options={[
              { value: "Basic", label: "Basic" },
              { value: "Boards", label: "Boards" },
              { value: "Neet", label: "Neet" },
              { value: "JeeMains", label: "JeeMains" },
              { value: "JeeAdvance", label: "JeeAdvance" },
            ]}
          />
          <label className="text-white-500 text-sm dark:text-white-400">
            Level
          </label>
        </div>

        <div className="relative z-0 w-full mb-5 group">
          <input
            type="text"
            name="question"
            id="question"
            className="block py-2.5 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-white-300 appearance-none dark:text-white dark:border-white-600 dark:focus:border-white-500 focus:outline-none focus:ring-0 focus:border-white-600 peer"
            placeholder=" "
            required
          />
          <label htmlFor="question" className="peer-focus:font-medium absolute text-sm text-white-500 dark:text-white-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-grey-600 peer-focus:dark:text-grey-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Add Questions</label>
        </div>

        {options.map((option, index) => (
          <div key={index} className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              name={`option${index}`}
              value={option}
              onChange={(e) => handleInputChange(index, e)}
              className="block py-2.5 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-white-300 appearance-none dark:text-white dark:border-white-600 dark:focus:border-white-500 focus:outline-none focus:ring-0 focus:border-white-600 peer"
              placeholder=" "
            />
            <label htmlFor={`option${index}`} className="peer-focus:font-medium absolute text-sm text-white-500 dark:text-white-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-white-600 peer-focus:dark:text-white-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Option {index + 1}</label>
          </div>
        ))}
        <div className="border text-white-600 mb-10 rounded-xl h-10 text-sm flex items-center justify-center cursor-pointer" onClick={addOption}>
          Add more options
        </div>

        {correctOptions.map((correctOption, index) => (
          <div key={index} className="relative z-0 w-full mb-5 group">
            <select
              name={`correct_option_${index}`}
              value={correctOption}
              onChange={(e) => handleSelectionChange(index, e)}
              className="block py-2.5 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-white-300 appearance-none dark:text-white dark:border-white-600 dark:focus:border-white-500 focus:outline-none focus:ring-0 focus:border-white-600 peer"
            >
              <option value="" disabled className="text-gray-900">Select Correct Option</option>
              {options
                .filter((opt) => opt)
                .map((name, optIndex) => (
                  <option key={optIndex} value={name} className="text-gray-900">{name}</option>
                ))}
            </select>
            <label htmlFor={`correct_option_${index}`} className="peer-focus:font-medium absolute text-sm text-white-500 dark:text-white-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-white-600 peer-focus:dark:text-white-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Correct Option</label>
          </div>
        ))}
        <div className="border mb-10 text-white-600 rounded-xl h-10 text-sm flex items-center justify-center cursor-pointer" onClick={addCorrectOption}>
          Add More Correct Options
        </div>

        {/* Submit button */}
        {questionLoading ? (
          <button type="submit" disabled className="text-white bg-white-500 hover:bg-white-800 focus:ring-4 focus:outline-none focus:ring-white-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-white-600 dark:hover:bg-white-700 dark:focus:ring-white-800">Submit</button>
        ) : (
          <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-white-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-white-600 dark:hover:bg-white-700 dark:focus:ring-white-800">Submit</button>
        )}
      </form>
    </main>
  );
};

export default CreateQuestion;