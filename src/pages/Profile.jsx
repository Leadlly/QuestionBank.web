import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteQuestion } from "../actions/questionAction";
import ProfileHead from "../components/ProfileHead";

const Profile = () => {
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const { isAuthenticated } = useSelector((state) => state.user);
  const { success, error } = useSelector((state) => state.delete);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate, isAuthenticated]);

  const handleDelete = async (id) => {
    if (window.confirm("Confirm before deletion")) {
      dispatch(deleteQuestion(id));

      setTimeout(() => {
        if (success) {
          toast.success("Question deleted successfully");
          if (selectedQuestion && selectedQuestion._id === id) {
            setSelectedQuestion(null);
          }
        } else if (error) {
          toast.error(error);
        }
      }, 500); 
    }
  };

  return (
    <div className="question_box pt-14">
      <ProfileHead setSelectedQuestion={setSelectedQuestion} />

      {selectedQuestion ? (
        <div className="box relative flex flex-col mt-6 m-7 text-white-700 shadow-md bg-clip-border rounded-xl">
          <div className="p-6">
          <h5 className="heading block mb-2 font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-white-900">
              Q. <span dangerouslySetInnerHTML={{ __html: selectedQuestion.question }} />
            </h5>
            {selectedQuestion.images.length > 0 && (
              <div className="mt-4">
                {selectedQuestion.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`Image ${index + 1}`}
                    className="max-w-full h-auto mb-2"
                  />
                ))}
              </div>
            )}
            <div className="options">
            <p>Options: </p>
              {selectedQuestion.options && selectedQuestion.options.length > 0 ? (
                selectedQuestion.options.map((option, idx) => (
                  <div key={idx} className="mb-4">
                   
                    {option.images && option.images.length > 0 && (
                      <div className="mt-2 ml-2">
                        {option.images.map((image, index) => (
                          <img
                            key={index}
                            src={image.url}
                            alt={`Option ${option.name} Image ${index + 1}`}
                            className="max-w-20 h-20 mb-2"
                          />
                        ))}
                      </div>
                    )}
                     <label className="option">
                      <input
                        type="radio"
                        name={`option_${selectedQuestion._id}`}
                        value={option.name}
                        checked={option.tag === 'Correct'}
                      />
                      <span className="option-text" dangerouslySetInnerHTML={{ __html: option.name }} />
                    </label>
                  </div>
                ))
              ) : (
                <p>No options available</p>
              )}
            </div>
            <p>Class: {selectedQuestion.standard}</p>
            <p>Subject: {selectedQuestion.subject}</p>
            <p>Chapter: {selectedQuestion.chapter.join(", ")}</p>
            <p>Topics: {selectedQuestion.topics.join(", ")}</p>
            <p>Level: {selectedQuestion.level}</p>
            <p>Subtopics: {selectedQuestion.subtopics.length > 0 ? selectedQuestion.subtopics.join(", ") : "N/A"}</p>
            <p>Nested Subtopic: {selectedQuestion.nestedSubTopic || "N/A"}</p>
           
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
  );
};

export default Profile;
