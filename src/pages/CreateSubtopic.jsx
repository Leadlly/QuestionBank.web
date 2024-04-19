import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { server, Context } from "../main";
import toast from "react-hot-toast";
import { Select } from "antd";
import { standards } from "../components/Options";

const CreateSubtopic = () => {
  const { setIsLoading, isLoading, setProfile } = useContext(Context);

  const [standard, setStandard] = useState();

  const [subject, setSubject] = useState();
  const [subjectList, setSubjectList] = useState();

  const [chapter, setChapter] = useState();
  const [chapterList, setChapterList] = useState();

  const [topic, setTopic] = useState();
  const [topicList, setTopicList] = useState();

  const [subtopics, setSubtopics] = useState([{name: '', subtopics: []}])

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


  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const formattedData = {
      subjectName: subject,
      standard: standard,
      chapterName: chapter,
      topicName: topic,
      subtopics: subtopics,
    };


    try {
      setIsLoading(true);
      const response = await axios.post(
        `${server}/api/create/subtopic`,
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
    setSubtopics([{name: '', subtopics: []}])
  };

  const addSubtopic = () => {
    setSubtopics([...subtopics, { name: "", subtopics: [] }]);
  };

  return (
    <main className=" p-4 ">
      <h1 className="text-center m-10">Create SubTopics</h1>
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
            className=" text-white-500 text-sm dark:text-white-400 "
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
              optionA.label.toLowerCase().localeCompare(optionB.label.toLowerCase())
            }
            onChange={(value) => {
              setTopic(value);
            }}
            value={topic}
            options={
              topicList &&
              topicList?.map((el) => ({ value: el.name, label: el.name }))
            }
            required
          />
          <label
            className=" text-white-500 text-sm dark:text-white-400 "
          >
            Topic
          </label>
        </div>
       
        
       
        {subtopics.map((subtopic, index) => (
  <div key={index} className="relative z-0 w-full mb-5 group">
    <input
      type="text"
      name="subtopic"
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
