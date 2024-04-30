import { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../main";
import toast from "react-hot-toast";
import ProfileHead from "../components/ProfileHead";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";


const Profile = () => {
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState(null); 
  const [isChecked, setIsChecked] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.user);
  const handleChange = () => {
    setIsChecked((prevState) => !prevState);
  };
  useEffect(() => {
    if(isAuthenticated === false) {
        navigate('/login')
        console.log("Authentication:" , isAuthenticated)
    }
    if(isAuthenticated){
      navigate('/profile')
      console.log("Authentication:" , isAuthenticated)
    }
}, [navigate, isAuthenticated])

  const handleDelete = async (id) => {
    try {
      if (window.confirm("Confirm before deletion")) {
        const { data } = await axios.delete(`${server}/api/delete/${id}`, {
          withCredentials: true,
        });
        toast.success(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message || "Something went wrong");
    }
  };

  return (
    <>

      <div className="question_box pt-14">
      <ProfileHead setSelectedQuestion={setSelectedQuestion} />
        {selectedQuestion ? (
          <div className="box relative flex flex-col mt-6 m-7 text-white-700 shadow-md bg-clip-border rounded-xl">
            <div className="p-6">
              <h5 className="heading block mb-2 font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-white-900">
                Q. {selectedQuestion.question}
              </h5>
              <div className="options">
                {selectedQuestion.options.all.map((option, idx) => (
                  <label key={idx} className="option">
                    <input
                      type="radio"
                      name={`option_${selectedQuestion._id}`}
                      value={option}
                      checked={isChecked}
                      onChange={handleChange}
                    />
                    <span className="option-text">{option}</span>
                  </label>
                ))}
              </div>
              <p>Class - {selectedQuestion.standard}</p>
              <p>Subject - {selectedQuestion.subject}</p>
              <p>Chapter - {selectedQuestion.chapter}</p>
              <p>Topic - {selectedQuestion.topic}</p>
              {selectedQuestion.subtopics && selectedQuestion.subtopics.length > 0 ? (
                selectedQuestion.subtopics.map((subtopic, idx) => (
                  <p key={idx}>Sub Topic - {subtopic.name}</p>
                ))
              ) : (
                <p>Sub Topic - N/A</p>
              )}
              <p>Level - {selectedQuestion.level}</p>
            </div>
            <div className="p-6 pt-0">
              <button
                className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg bg-red-700 text-white shadow-md shadow-red-700/10 hover:shadow-lg hover:shadow-red-700/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none"
                type="button"
                onClick={() => handleDelete(selectedQuestion._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div>No question selected</div>
        )}
      </div>
    </>
  );
};

export default Profile;
