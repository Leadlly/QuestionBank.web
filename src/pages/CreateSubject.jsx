import {  useState } from "react";
import toast from "react-hot-toast";
import {Select} from 'antd'
import { standards } from "../components/Options";
import { useDispatch, useSelector } from "react-redux";
import { createSubject } from "../actions/subjectAction";

const CreateSubject = () => {
  const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.createSubject); 

  const [standard, setStandard] = useState();

  const resetFields = (form) => {
    const questionInput = form.querySelector('[name="subject"]');
    if (questionInput) {
      questionInput.value = "";
    }
  };
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
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

    const formattedData = {
      subjectName: data.subject,
      standard: standard,
    };

    dispatch(createSubject(formattedData));
    if (!isLoading) {
      toast.success("Subject added successfully!");
      resetFields(event.target);
  }

    setStandard(standard)
    resetFields(event.target);
  };

  return (
    <main className=" p-4 ">
      <h1 className="text-center m-10 text-white-600">Create Subject</h1>
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
            value={standard}
            onChange={(value) => {
              setStandard(value);
            }}
            options={standards}
          />
          <label
            className=" text-white-500 text-sm dark:text-white-400 "
          >
            Standard
          </label>
        </div>

        <div className="relative z-0 w-full mb-5 group">
          <input
            type="text"
            name="subject"
            id="subject"
            className="block py-2.5 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-white-300 appearance-none dark:text-white dark:border-white-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            required
          />
          <label
            htmlFor="subject"
            className="peer-focus:font-medium absolute text-sm text-white-500 dark:text-white-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-white-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Add Subject
          </label>
        </div>


        {isLoading ? (
          <button
            type="submit"
            disabled
            className="text-white bg-white-500 hover:bg-white-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-white-600 dark:hover:bg-white-700 dark:focus:ring-white-800"
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

export default CreateSubject;
