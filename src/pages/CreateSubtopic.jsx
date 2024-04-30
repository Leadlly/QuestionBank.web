import {  useEffect, useState } from "react";
// import axios from "axios";
// import { server } from "../main";
import toast from "react-hot-toast";
import { Select } from "antd";
import { standards } from "../components/Options";
import { useDispatch, useSelector } from "react-redux";
import { createSubtopic } from "../actions/subtopicAction";
import { getSubjects } from "../actions/subjectAction";
import { getChapters } from "../actions/chapterAction";
import { getTopics } from "../actions/topicAction";

const CreateSubtopic = () => {
  const dispatch = useDispatch();
  const { isLoading  } = useSelector((state) => state.subtopic); 
  const { subjectList } = useSelector((state) => state.getSubject); 
  const { chapterList } = useSelector((state) => state.getChapter); 
  const { topicList } = useSelector((state) => state.getTopic);
  const [standard, setStandard] = useState("");
  const [subject, setSubject] = useState("");
  // const [subjectList, setSubjectList] = useState([]);
  const [chapter, setChapter] = useState("");
  // const [chapterList, setChapterList] = useState([]);
  const [topic, setTopic] = useState("");
  // const [topicList, setTopicList] = useState([]);
  const [subtopics, setSubtopics] = useState([{ name: "" }]);


  useEffect(() => {
    if (standard) {
      dispatch(getSubjects(standard));
    }
    if (subject && standard) {
    dispatch(getChapters(subject, standard))
    }
    if (subject && standard && chapter) {
      dispatch(getTopics(subject, standard, chapter));
    }
  }, [standard, dispatch, subject, chapter, topic])


  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const formattedData = {
      subjectName: subject,
      standard: standard,
      chapterName: chapter,
      topicName: topic,
      subtopics: subtopics,
    };

    dispatch(createSubtopic(formattedData))
    if (!isLoading) {
      toast.success("subtopic added successfully!");
  }
    setSubtopics([{ name: "" }]);
  };

  const addSubtopic = () => {
    setSubtopics((prev) => [...prev, { name: "" }]);
  };

  return (
    <main className=" p-4 ">
      <h1 className="text-center m-10 text-white-600">Create Questions</h1>
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
            filterSort={(optionA, optionB) =>
              optionA.label
                .toLowerCase()
                .localeCompare(optionB.label.toLowerCase())
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
            showSearch
            style={{ width: 200 }}
            placeholder="Select Chapter"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            filterSort={(optionA, optionB) =>
              optionA.label
                .toLowerCase()
                .localeCompare(optionB.label.toLowerCase())
            }
            onChange={(value) => {
              setChapter(value);
              getTopics(value);
            }}
            value={chapter}
            options={
              chapterList &&
              chapterList.map((chapter) => ({
                value: chapter.name,
                label: chapter.name,
                key: chapter._id,
              }))
            }
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
            showSearch
            style={{ width: 200 }}
            placeholder="Select Topic"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            filterSort={(optionA, optionB) =>
              optionA.label
                .toLowerCase()
                .localeCompare(optionB.label.toLowerCase())
            }
            onChange={(value) => {
              setTopic(value);
              // getSubtopics(value);
            }}
            value={topic}
            options={
              topicList &&
              topicList?.map((el) => ({ value: el.name, label: el.name }))
            }
            required
          />
          <label className=" text-white-500 text-sm dark:text-white-400 ">
            Topic
          </label>
        </div>

        {/* Subtopics inputs */}
        {subtopics.map((subtopic, index) => (
          <div key={index} className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              name={`subtopic-${index}`}
              id={`subtopic-${index}`}
              className="block py-2.5 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-white-300 appearance-none dark:text-white dark:border-white-600 dark:focus:border-white-500 focus:outline-none focus:ring-0 focus:border-white-600 peer"
              placeholder=" "
              value={subtopic.name}
              onChange={(e) => {
                const updatedSubtopics = [...subtopics];
                updatedSubtopics[index].name = e.target.value;
                setSubtopics(updatedSubtopics);
              }}
              required
            />
            <label
              htmlFor={`subtopic-${index}`}
              className="peer-focus:font-medium absolute text-sm text-white-500 dark:text-white-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-white-600 peer-focus:dark:text-white-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Add Subtopic
            </label>
          </div>
        ))}
        <div
          className="border mb-10 rounded-xl h-10 text-sm flex items-center justify-center cursor-pointer"
          onClick={addSubtopic}
        >
          Add more subtopic
        </div>

        {/* Submit button */}
        {isLoading ? (
          <button
            type="submit"
            disabled
            className="text-white bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Submit
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
