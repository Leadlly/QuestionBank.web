import  {  useState, useContext } from "react";
import axios from "axios";
import { server, Context } from "../main";
import toast from "react-hot-toast";
import {Select} from 'antd'
import { standards } from "../components/Options";

const CreateTopic = () => {
  const { setIsLoading, isLoading } = useContext(Context);
  const [standard, setStandard] = useState();

  const [subject, setSubject] = useState();
  const [subjectList, setSubjectList] = useState();

  const [chapter, setChapter] = useState();
  const [chapterList, setChapterList] = useState();
  const [topics, setTopics] = useState([{ name: "", subtopics: [] }]); // Array of topics


  const getSubject = async (standard) => {
    try {
      const { data } = await axios.get(
        `${server}/api/get/subject?standard=${standard}`,
        {
          withCredentials: true,
        },
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
        },
      );
      setChapterList(data.chapters);
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
      topics: topics
    };

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${server}/api/create/topic`,
        formattedData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      setIsLoading(false);
      toast.success(response.data.message);
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response.data.message || "Something went wrong");
    }

     setTopics([{name: ''}])
  };

  const handleTopicChange = (index, value) => {
    const updatedTopics = [...topics];
    updatedTopics[index].name = value;
    setTopics(updatedTopics);
  };

  const handleAddTopic = () => {
    setTopics([...topics, { name: "", subtopics: [] }]);
  };

  return (
    <main className=" p-4 ">
      <h1 className="text-center m-10">Create Topic</h1>
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
          //  filterSort={(optionA, optionB) =>
          //    (optionA?.label ?? "")
          //      .toLowerCase()
          //      .localeCompare((optionB?.label ?? "").toLowerCase())
          //  }
           onChange={(value) => {
             setStandard(value);
             getSubject(value);
           }}
           options={standards}
         />
         <label
           htmlFor="standard"
           className=" text-gray-500 text-sm dark:text-gray-400 "
         >
           Subject
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
        <div className="relative z-0 w-full mb-5 group">
        {topics.map((topic, index) => (
          <div
            key={index}
            className="relative z-0 w-full mb-5 group flex flex-col-reverse"
          >
            <input
              type="text"
              name={`topic-${index}`}
              id={`topic-${index}`}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-gray-500 focus:outline-none focus:ring-0 focus:border-gray-600 peer"
              placeholder=" "
              value={topic.name}
              onChange={(e) => handleTopicChange(index, e.target.value)}
            />
              <label
            htmlFor="topic"
            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-focus:dark:text-gray-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
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
        {/* </div> */}

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

export default CreateTopic;
