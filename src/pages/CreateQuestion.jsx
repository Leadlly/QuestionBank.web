import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { server, Context } from "../main";
import toast from "react-hot-toast";
import { Select } from "antd";
import { standards } from "../components/Options";

const CreateQuestion = () => {
  const { setIsLoading, isLoading, setProfile } = useContext(Context);

  const [standard, setStandard] = useState();

  const [subject, setSubject] = useState();
  const [subjectList, setSubjectList] = useState();

  const [chapter, setChapter] = useState();
  const [chapterList, setChapterList] = useState();

  const [topic, setTopic] = useState();
  const [topicList, setTopicList] = useState();

  const [subTopic, setSubTopic] = useState('');
  const [subTopicList, setSubTopicList] = useState();

  const [level, setLevel] = useState('')

  const [options, setOptions] = useState([""]);
  const [correctOptions, setCorrectOptions] = useState([""]);

  const [nestedSubtopics, setNestedSubtopics] = useState({});
  // console.log(options)

  const fetchUser = async () => {
    try {
      // Let's say we're fetching data from an API
      const { data } = await axios.get(`${server}/api/user/profile`, {
        withCredentials: true,
      });
      setProfile(data?.user);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const getSubject = async (standard) => {
    try {
      const { data } = await axios.get(
        `${server}/api/get/subject?standard=${standard}`,
        {
          withCredentials: true,
        }
      );
      setSubjectList(data.subjectList);
    } catch (error) {
      console.log(error);
    }
  };

  const getChapters = async (subject) => {
    try {
      const { data } = await axios.get(
        `${server}/api/get/chapter?subjectName=${subject}&standard=${standard}`,
        {
          withCredentials: true,
        }
      );
      setChapterList(data.chapters);
    } catch (error) {
      console.log(error);
    }
  };

  const getTopics = async (chapter) => {
    try {
      const { data } = await axios.get(
        `${server}/api/get/topic?subjectName=${subject}&standard=${standard}&chapterName=${chapter}`,
        {
          withCredentials: true,
        }
      );
      console.log(data)
      setTopicList(data.topics);
    } catch (error) {
      console.log(error);
    }
  };

  const getSubtopics = async (topic) => {
    try {
      const { data } = await axios.get(
        `${server}/api/get/subtopic?subjectName=${subject}&standard=${standard}&chapterName=${chapter}&topicName=${topic}`,
        {
          withCredentials: true,
        }
      );
      setSubTopicList(data.subtopics);
      // If nested subtopics exist, initialize an empty object for them
      if (data.subtopics && data.subtopics.length > 0) {
        const nestedSubtopicsObj = {};
        data.subtopics.forEach((subtopic) => {
          if (subtopic.subtopics && subtopic.subtopics.length > 0) {
            nestedSubtopicsObj[subtopic.name] = '';
          }
        });
        setNestedSubtopics(nestedSubtopicsObj);
   
      }
      setSubTopic('')
    } catch (error) {
      console.log(error);
    }
  };

  // Function to handle input change
  const handleInputChange = (index, event) => {
    const newOptions = [...options];
    newOptions[index] = event.target.value;

    if (
      index === options.length - 1 &&
      event.target.value !== "" &&
      options.length < 4
    ) {
      newOptions.push(""); // Add another empty option to the array
    }
    setOptions(newOptions);
  };

  // Function to add a new input field (option)
  const addOption = () => {
    setOptions([...options, ""]);
  };

  const handleSelectionChange = (index, event) => {
    const newCorrectOptions = [...correctOptions];
    newCorrectOptions[index] = event.target.value;
    setCorrectOptions(newCorrectOptions);
  };

  // Add new select for correct option
  const addCorrectOption = () => {
    if (correctOptions.length < options.length) {
      setCorrectOptions([...correctOptions, ""]);
    }
  };

  const resetFields = (form) => {
    const questionInput = form.querySelector('[name="question"]');
    if (questionInput) {
      questionInput.value = "";
    }

    setOptions([""]);
    setCorrectOptions([""]);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    console.log(formData, '====>formdata')
    const data = {};

    for (let [name, value] of formData.entries()) {
      if (data[name]) {
        if (Array.isArray(data[name])) {
          data[name].push(value);
        } else {
          data[name] = [data[name], value];
        }
      } else {
        data[name] = value;
      }
    }

    console.log(data);
    const formattedData = {
      question: data.question,
      options: {
        all: options,
        correct: correctOptions,
      },
      standard: standard,
      subject: subject,
      chapter: chapter,
      topic: topic,
      subtopics: subTopic ? [{ name: subTopic, subtopics: [] }] : [],
      level: level,
    };

    console.log(formattedData);

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${server}/api/create/question`,
        formattedData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      toast.success(response.data.message);
      setIsLoading(false);

      fetchUser();
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response.data.message || "Something went wrong");
    }
    setStandard(standard)
    setSubject(subject)
    setChapter(chapter)
    setTopic(topic)
    setLevel(level)
    resetFields(event.target);
  };

  return (
    <main className=" p-4 ">
      <h1 className="text-center m-10 text-gray-600">Create Questions</h1>
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
            // filterSort={(optionA, optionB) =>
            //   (optionA?.label ?? "")
            //     .toLowerCase()
            //     .localeCompare((optionB?.label ?? "").toLowerCase())
            // }
            onChange={(value) => {
              setStandard(value);
              getSubject(value);
            }}
            options={standards}
          />
          <label
            className=" text-gray-500 text-sm dark:text-gray-400 "
          >
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
            onChange={(value) => {
              setSubject(value);
              getChapters(value);
            }}
            value={subject}
            options={
              subjectList &&
              subjectList.map((name) => ({ value: name, label: name }))
            }
            required
          />

          <label
            htmlFor="subject"
            className=" text-gray-500 text-sm dark:text-gray-400 "
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
              optionA.label.toLowerCase().localeCompare(optionB.label.toLowerCase())
            }
            onChange={(value) => {
              setChapter(value);
              getTopics(value);
            }}
            value={chapter}
            options={
              chapterList &&
              chapterList?.map((name) => ({ value: name, label: name }))
            }
            required
          />
          <label
            htmlFor="chapter"
            className=" text-gray-500 text-sm dark:text-gray-400 "
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
              optionA.label.toLowerCase().localeCompare(optionB.label.toLowerCase())
            }
            onChange={(value) => {
              setTopic(value);
              getSubtopics(value)
            }}
            value={topic}
            options={
              topicList &&
              topicList?.map((el) => ({ value: el.name, label: el.name }))
            }
            required
          />
          <label
            className=" text-gray-500 text-sm dark:text-gray-400 "
          >
            Topic
          </label>
        </div>
        {
          subTopicList && subTopicList.length > 0 &&  <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
          
          <Select
          showSearch
          style={{ width: 200 }}
          placeholder="Select Subtopic"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
          filterSort={(optionA, optionB) =>
            optionA.label.toLowerCase().localeCompare(optionB.label.toLowerCase())
          }
          onChange={(value) => {
            // setChapter(value);
            setSubTopic(value);
          }}
          value={subTopic}
          options={
            subTopicList &&
            subTopicList?.map((el) => ({ value: el.name, label: el.name }))
          }
        />
        <label
          className=" text-gray-500 text-sm dark:text-gray-400 "
        >
          Subtopic
        </label>
      </div>
        }
       
        {Object.entries(nestedSubtopics).map(([subtopicName, nestedSubtopic]) => (
  <div key={subtopicName} className="relative z-0 w-full mb-5 group flex flex-col-reverse">
    <Select
      showSearch
      style={{ width: 200 }}
      placeholder={`Select ${subtopicName} Subtopic`}
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.label.toLowerCase().includes(input.toLowerCase())
      }
      filterSort={(optionA, optionB) =>
        optionA.label.toLowerCase().localeCompare(optionB.label.toLowerCase())
      }
      onChange={(value) => {
        const updatedNestedSubtopics = { ...nestedSubtopics };
        updatedNestedSubtopics[subtopicName] = value;
        setNestedSubtopics(updatedNestedSubtopics);
      }}
      value={nestedSubtopic}
      options={
        subTopicList &&
        subTopicList.map((el) => ({ value: el.name, label: el.name }))
      }
    />
    <label
      className="text-gray-500 text-sm dark:text-gray-400"
    >
      {subtopicName} Subtopic
    </label>
  </div>
))}
        <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
          
           <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select Level"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            filterSort={(optionA, optionB) =>
              optionA.label.toLowerCase().localeCompare(optionB.label.toLowerCase())
            }
            value={level}
            onChange={(value) => {
              setLevel(value);
            }}
            options={[
              {
                value: "Basic",
                label: "Basic",
              },
              {
                value: "Boards",
                label: "Boards",
              },
              {
                value: "Neet",
                label: "Neet",
              },
              {
                value: "JeeMains",
                label: "JeeMains",
              },
              {
                value: "JeeAdvance",
                label: "JeeAdvance",
              },
            ]} />
          <label
            className=" text-gray-500 text-sm dark:text-gray-400 "
          >
            Level
          </label>
        </div>
        <div className="relative z-0 w-full mb-5 group">
          <input
            type="text"
            name="question"
            id="question"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-gray-500 focus:outline-none focus:ring-0 focus:border-gray-600 peer"
            placeholder=" "
            // value={ques}
            // onChange={e => setQues(e.target.value)}
            required
          />
          <label
            htmlFor="question"
            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-grey-600 peer-focus:dark:text-grey-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Add Questions
          </label>
        </div>
        {options.map((option, index) => (
          <div key={index} className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              name={`option${index}`}
              value={option}
              onChange={(e) => handleInputChange(index, e)}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-gray-500 focus:outline-none focus:ring-0 focus:border-gray-600 peer"
              placeholder=" "
            />
            <label
              htmlFor={`option${index}`}
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-focus:dark:text-gray-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Option {index + 1}
            </label>
          </div>
        ))}
        <div
          className="border text-gray-600 mb-10 rounded-xl h-10 text-sm flex items-center justify-center cursor-pointer"
          onClick={addOption}
        >
          Add more options
        </div>

        {correctOptions.map((correctOption, index) => (
          <div key={index} className="relative z-0 w-full mb-5 group">
            <select
              name={`correct_option_${index}`}
              value={correctOption}
              onChange={(e) => handleSelectionChange(index, e)}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-gray dark:border-gray-600 dark:focus:border-gray-500 focus:outline-none focus:ring-0 focus:border-gray-600 peer"
            >
              <option value="" disabled>
                Select Correct Option
              </option>
              {options
                .filter((opt) => opt)
                .map((name, optIndex) => (
                  <option key={optIndex} value={name}>
                    {name}
                  </option>
                ))}
            </select>
            <label
              htmlFor={`correct_option_${index}`}
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-focus:dark:text-gray-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Correct Option
            </label>
          </div>
        ))}

        <div
          className="border mb-10 text-gray-600 rounded-xl h-10 text-sm flex items-center justify-center cursor-pointer"
          onClick={addCorrectOption}
        >
          Add More Correct Options
        </div>
        {isLoading ? (
          <button
            type="submit"
            disabled
            className="text-white bg-gray-500 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
          >
            Submit
          </button>
        ) : (
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
          >
            Submit
          </button>
        )}
      </form>
    </main>
  );
};

export default CreateQuestion;
