import { useState, useContext } from "react";
import axios from "axios";
import { server, Context } from "../main";
import toast from "react-hot-toast";
import {Select} from 'antd'
import { standards } from "../components/Options";

const CreateChapter = () => {
  const { setIsLoading, isLoading } = useContext(Context);
  const [standard, setStandard] = useState();

  const [subject, setSubject] = useState();
  const [subjectList, setSubjectList] = useState();
  const [chapters, setChapters] = useState([{ name: "" }]); // Array of chapters


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




  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const formattedData = {
      subjectName: subject,
      standard: standard,
      chapters: chapters
    };

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${server}/api/create/chapter`,
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

    setChapters([{name: ""}])
  };

  const handleChapterChange = (index, value) => {
    const updatedChapters = [...chapters];
    updatedChapters[index].name = value;
    setChapters(updatedChapters);
  };

  const handleAddChapter = () => {
    setChapters([...chapters, { name: "" }]);
  };

  return (
    <main className=" p-4 ">
      <h1 className="text-center m-10 text-white-600">Create Chapter</h1>
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
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? "")
                .toLowerCase()
                .localeCompare((optionB?.label ?? "").toLowerCase())
            }
            value={standard}
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
            // filterSort={(optionA, optionB) =>
            //   optionA.label.toLowerCase().localeCompare(optionB.label.toLowerCase())
            // }
            onChange={(value) => {
              setSubject(value);
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

        <div className="relative z-0 w-full mb-5 group">
        {chapters.map((chapter, index) => (
          <div
            key={index}
            className="relative z-0 w-full mb-5 group flex flex-col-reverse"
          >
            <input
              type="text"
              name={`chapter-${index}`}
              id={`chapter-${index}`}
              className="block py-2.5 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-white-300 appearance-none dark:text-white dark:border-white-600 dark:focus:border-white-500 focus:outline-none focus:ring-0 focus:border-white-600 peer"
              placeholder=" "
              value={chapter.name}
              onChange={(e) => handleChapterChange(index, e.target.value)}
            />
              <label
            htmlFor="chapter"
            className="peer-focus:font-medium absolute text-sm text-white-500 dark:text-white-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-white-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Add Chapter
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
        {/* </div> */}

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
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Submit
          </button>
        )}
      </form>
    </main>
  );
};

export default CreateChapter;
