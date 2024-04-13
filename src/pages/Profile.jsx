import { useContext, useState } from "react";
import { Context } from "../main";
import axios from "axios";
import { server } from "../main";
import toast from "react-hot-toast";

const Profile = () => {
  const { profile, setProfile } = useContext(Context);
  const [isChecked, setIsChecked] = useState(false);
  const handleChange = () => {
    setIsChecked((prevState) => !prevState);
  };
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
  const handleDelete = async (id) => {
    try {
      if (window.confirm("1st confirm before deletion")) {
        const { data } = await axios.delete(`${server}/api/delete/${id}`, {
          withCredentials: true,
        });

        toast.success(data.message);
        fetchUser();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message || "Something went wrong");
    }
  };

  return (
    <>
      <div className="question_box">
      {profile && profile.questions.length > 0
  ? profile.questions.map((el) => (
      <div key={el._id} className="box relative flex flex-col mt-6 m-7 text-white-700  shadow-md bg-clip-border rounded-xl">
        <div className="p-6">
          <h5 className=" heading block mb-2 font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
            Q. {el.question}
          </h5>

          Options:{""}
          <div className="options">
    {el.options.all.map((option, idx) => (
      <label key={idx} className="option" >
         <input type="radio" name={`option_${el._id}`} value={option} checked={isChecked} onChange={handleChange}/>
        <span className="option-text">{option}</span>
      </label>
    ))}
  </div>
          <p>Class - {el?.standard}</p>
          <p>Subject - {el?.subject}</p>
          <p>Chapter - {el?.chapter}</p>
          <p>Topic - {el?.topic}</p>
          {el.subtopics && el.subtopics.length > 0 ? (
  el.subtopics.map((subtopic, idx) => (
    <p key={idx}>Sub Topic - {subtopic.name}</p>
  ))
) : (
  <p>Sub Topic - N/A</p>
)}
          <p>Level - {el?.level}</p>
        </div>
        <div className="p-6 pt-0">
          <button
            className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg bg-red-700 text-white shadow-md shadow-red-700/10 hover:shadow-lg hover:shadow-red-700/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none"
            type="button"
            onClick={() => handleDelete(el._id)}
          >
            Delete
          </button>
        </div>
      </div>
  ))
  : "No Question found"}

      </div>
    </>
  );
};

export default Profile;
