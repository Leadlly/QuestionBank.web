import { useEffect, useState } from "react";
import { Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { standards } from "../components/Options";
import { getSubjects } from "../actions/subjectAction";
import { getChapters } from "../actions/chapterAction";
import { getTopics } from "../actions/topicAction";
import { getSubtopics } from "../actions/subtopicAction";
import { createQuestion } from "../actions/questionAction";
import { getNestedSubtopicsByName } from "../actions/subtopicAction";

const CreateQuestion = () => {
  const dispatch = useDispatch();

  // State variables
  const [standard, setStandard] = useState(null);
  const [subject, setSubject] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [topic, setTopic] = useState(null);
  const [subTopic, setSubTopic] = useState(null);
  const [nestedSubtopic, setNestedSubtopic] = useState(null);
  const [level, setLevel] = useState(null);

  const [options, setOptions] = useState([""]);
  const [correctOptions, setCorrectOptions] = useState([""]);

  // Selectors
  const { subjectList } = useSelector((state) => state.getSubject);
  const { chapterList } = useSelector((state) => state.getChapter);
  const { topicList } = useSelector((state) => state.getTopic);
  const { subtopics } = useSelector((state) => state.getSubtopic);
  const { nestedSubtopics } = useSelector((state) => state.nestedsubtopic);
  const { isLoading: questionLoading } = useSelector((state) => state.question);

  // Effect to fetch data based on selections
  useEffect(() => {
    if (standard) {
      dispatch(getSubjects(standard));
    }
    setSubTopic(null);
    setNestedSubtopic(null);

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

  const handleSubTopicChange = (value) => {
    setSubTopic(value);
    setNestedSubtopic(null);

    dispatch(getNestedSubtopicsByName(subject, standard, chapter, topic, value));
};

const handleFormSubmit = async (event) => {
  event.preventDefault();

  // Collect form data
  const formData = new FormData(event.target);
  const data = {};
  for (const [name, value] of formData.entries()) {
      data[name] = value;
  }

  // Prepare formatted data
  const formattedData = {
      question: data.question,
      options: {
          all: options.filter(opt => opt.trim() !== ""),
          correct: correctOptions.filter(opt => opt.trim() !== ""),
      },
      standard,
      subject,
      chapter,
      topic,
      subTopic,
      nestedSubtopic, // Add nestedSubtopic data here
      level,
  };

  // Submit the question data
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

const addCorrectOption = () => {
  if (correctOptions.length < options.length) {
    setCorrectOptions([...correctOptions, ""]);
  }
};

const addOption = () => {
  setOptions([...options, ""]);
};

const resetFormFields = () => {
    document.getElementById("question").value = "";
    setOptions([""]);
    setCorrectOptions([""]);
};

return (
  <main className="p-4">
    <h1 className="text-center m-10 text-white-600">Create Questions</h1>
    <form className="max-w-md mx-auto" onSubmit={handleFormSubmit}>
        {/* Standard Selection */}
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

        {/* Subject Selection */}
        <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
            <Select
                showSearch
                style={{ width: 200 }}
                placeholder="Select Subject"
                onChange={(value) => setSubject(value)}
                options={subjectList?.map((name) => ({
                    value: name,
                    label: name
                }))}
                value={subject}
            />
            <label htmlFor="subject" className="text-white-500 text-sm dark:text-white-400">
                Subject
            </label>
        </div>

        {/* Chapter Selection */}
        <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
            <Select
                showSearch
                style={{ width: 200 }}
                placeholder="Select Chapter"
                onChange={(value) => setChapter(value)}
                options={chapterList?.map((chapter) => ({
                    value: chapter.name,
                    label: chapter.name
                }))}
                value={chapter}
            />
            <label htmlFor="chapter" className="text-white-500 text-sm dark:text-white-400">
                Chapter
            </label>
        </div>

        {/* Topic Selection */}
        <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
            <Select
                showSearch
                style={{ width: 200 }}
                placeholder="Select Topic"
                onChange={(value) => setTopic(value)}
                options={topicList?.map((el) => ({
                    value: el.name,
                    label: el.name
                }))}
                value={topic}
            />
            <label className="text-white-500 text-sm dark:text-white-400">
                Topic
            </label>
        </div>

        {/* Subtopic Selection */}
        {topic && subtopics?.length > 0 && (
            <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
                <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder="Select Subtopic"
                    onChange={handleSubTopicChange}
                    options={subtopics.map((el) => ({
                        value: el.name,
                        label: el.name
                    }))}
                    value={subTopic}
                />
                <label className="text-sm dark:text-white-400">Subtopic</label>
            </div>
        )}

        {/* Nested Subtopic Selection */}
        {subTopic && nestedSubtopics && nestedSubtopics.length > 0 && (
            <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
                <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder="Select Nested Subtopic"
                    options={nestedSubtopics.map((nestedSubtopic) => ({
                        value: nestedSubtopic.name,
                        label: nestedSubtopic.name,
                    }))}
                    value={nestedSubtopic}
                    onChange={setNestedSubtopic}
                />
                <label className="text-sm dark:text-white-400">Nested Subtopic</label>
            </div>
        )}


        {/* Level Selection */}
        <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select Level"
            onChange={(value) => setLevel(value)}
            options={[
              { value: "Basic", label: "Basic" },
              { value: "Boards", label: "Boards" },
              { value: "Neet", label: "Neet" },
              { value: "JeeMains", label: "JeeMains" },
              { value: "JeeAdvance", label: "JeeAdvance" },
            ]}
            value={level}
          />
          <label className="text-white-500 text-sm dark:text-white-400">
            Level
          </label>
        </div>

        {/* Question Input */}
        <div className="relative z-0 w-full mb-5 group">
          <input
            type="text"
            name="question"
            id="question"
            className="block py-2.5 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-white-300 appearance none dark:text-white dark:border-white-600 dark:focus:border-white-500 focus:outline-none focus:ring-0 focus:border-white-600 peer"
            placeholder="Add Questions"
            required
          />
          <label
            htmlFor="question"
            className="peer-focus:font-medium absolute text-sm text-white-500 dark:text-white-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-grey-600 peer-focus:dark:text-grey-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Add Questions
          </label>
        </div>

        {/* Options Inputs */}
        {options.map((option, index) => (
          <div key={index} className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              name={`option${index}`}
              value={option}
              onChange={(e) => {
                handleInputChange(index, e);
              }}
              className="block py-2.5 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-white-300 appearance none dark:text-white dark:border-white-600 dark:focus:border-white-500 focus:outline-none focus:ring-0 focus:border-white-600 peer"
              placeholder="Option"
            />
            <label
              htmlFor={`option${index}`}
              className="peer-focus:font-medium absolute text-sm text-white-500 dark:text-white-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-white-600 peer-focus:dark:text-white-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Option {index + 1}
            </label>
          </div>
        ))}

        {/* Add More Options Button */}
        {options.length < 4 && (
          <div
            className="border text-white-600 mb-10 rounded-xl h-10 text-sm flex items-center justify-center cursor-pointer"
            onClick={addOption}
          >
            Add more options
          </div>
        )}

        {/* Correct Options Selection */}
        {correctOptions.map((correctOption, index) => (
          <div key={index} className="relative z-0 w-full mb-5 group">
            <select
              name={`correct_option_${index}`}
              value={correctOption}
              onChange={(e) => handleSelectionChange(index, e)}
              className="block py-2.5 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-white-300 appearance none dark:text-white dark:border-white-600 dark:focus:border-white-500 focus:outline-none focus:ring-0 focus:border-white-600 peer"
            >
              <option value="" disabled className="text-gray-900">
                Select Correct Option
              </option>
              {options
                .filter((opt) => opt)
                .map((name, optIndex) => (
                  <option key={optIndex} value={name} className="text-gray-900">
                    {name}
                  </option>
                ))}
            </select>
            <label
              htmlFor={`correct_option_${index}`}
              className="peer-focus:font-medium absolute text-sm text-white-500 dark:text-white-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-white-600 peer-focus:dark:text-white-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Correct Option
            </label>
          </div>
        ))}

        {/* Add More Correct Options Button */}
        {correctOptions.length < options.length && (
          <div
            className="border mb-10 text-white-600 rounded-xl h-10 text-sm flex items-center justify-center cursor-pointer"
            onClick={addCorrectOption}
          >
            Add More Correct Options
          </div>
        )}

        {/* Submit Button */}
        {questionLoading ? (
          <button
            type="submit"
            disabled
            className="text-white bg-white-500 hover:bg-white-800 focus:ring-4 focus:outline-none focus:ring-white-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-white-600 dark:hover:bg-white-700 dark:focus:ring-white-800"
          >
            Submit
          </button>
        ) : (
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-white-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-white-600 dark:hover:bg-white-700 dark:focus:ring-white-800"
          >
            Submit
          </button>
        )}
      </form>
    </main>
  );
};

export default CreateQuestion;
