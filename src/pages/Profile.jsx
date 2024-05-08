import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ProfileHead from "../components/ProfileHead";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteQuestion } from "../actions/questionAction";
import "../styles/login.scss"

const Profile = () => {
    const navigate = useNavigate();
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const { isAuthenticated } = useSelector((state) => state.user);
    const { success, error } = useSelector((state) => state.delete);
    const dispatch = useDispatch();

    useEffect(() => {
        if (isAuthenticated === false) {
            navigate("/login");
        }
    }, [navigate, isAuthenticated]);

    const handleDelete = async (id) => {
        try {
            if (window.confirm("Confirm before deletion")) {
                await dispatch(deleteQuestion(id));

                if (success) {
                    toast.success("Question deleted successfully");
                    if (selectedQuestion && selectedQuestion._id === id) {
                        setSelectedQuestion(null);
                    }
                } else if (error) {
                    toast.error(error);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Something went wrong");
        }
    };

    return (
        <div className="question_box pt-14">
            {/* ProfileHead component */}
            <ProfileHead setSelectedQuestion={setSelectedQuestion} />

            {/* Display selected question details */}
            {selectedQuestion ? (
                <div className="box relative flex flex-col mt-6 m-7 text-white-700 shadow-md bg-clip-border rounded-xl">
                    <div className="p-6">
                        <h5 className="heading block mb-2 font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-white-900">
                            Q. {selectedQuestion.question}
                        </h5>
                        <div className="options">
                            {/* Display options */}
                            {selectedQuestion.options.all.map((option, idx) => (
                                <label key={idx} className="option">
                                    <input type="radio" name={`option_${selectedQuestion._id}`} value={option} />
                                    <span className="option-text">{option}</span>
                                </label>
                            ))}
                        </div>
                        {/* Display question details */}
                        <p>Class - {selectedQuestion.standard}</p>
                        <p>Subject - {selectedQuestion.subject}</p>
                        <p>Chapter - {selectedQuestion.chapter}</p>
                        <p>Topic - {selectedQuestion.topic}</p>
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
    );
};

export default Profile;
