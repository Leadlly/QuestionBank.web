import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteQuestion, editQuestion } from "../actions/questionAction";
import ProfileHead from "../components/ProfileHead";
import { LuPencilLine } from "react-icons/lu";
import { server } from "../main";
import axios from "axios";

const Profile = () => {
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(""); // Initialize empty
  const [editedOption, setEditedOption] = useState({ id: "", name: "", tag: "" }); // State for editing option

  const { isAuthenticated } = useSelector((state) => state.user);
  const { success: deleteSuccess, error: deleteError } = useSelector((state) => state.delete);
  const { success: editSuccess, error: editError } = useSelector((state) => state.editQuestion);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate, isAuthenticated]);

  useEffect(() => {
    if (editSuccess) {
      toast.success("Question updated successfully");
      setSelectedQuestion((prevQuestion) => ({
        ...prevQuestion,
        question: editedQuestion,
      }));
      setIsEditModalOpen(false);
    }
    if (editError) {
      toast.error(editError);
    }
  }, [editSuccess, editError, editedQuestion]);

  const handleDelete = async (id) => {
    if (window.confirm("Confirm before deletion")) {
      dispatch(deleteQuestion(id));

      setTimeout(() => {
        if (deleteSuccess) {
          toast.success("Question deleted successfully");
          
          // Reset selected question to null to re-render the component
          setSelectedQuestion(null);
        } else if (deleteError) {
          toast.error(deleteError);
        }
      }, 500);
    }
  };

  const handleEditQuestion = (question) => {
    setEditedQuestion(question.question); // Initialize editedQuestion with current question text
    setSelectedQuestion(question); // Optionally update selectedQuestion state
    setIsEditModalOpen(true);
  };

  const handleEditOption = (option) => {
    setEditedOption({
      id: option._id,
      name: option.name,
      tag: option.tag,
    });
    setIsEditModalOpen(true);
  };

  const updateOption = async () => {
    try {
      const response = await axios.put(
        `${server}/api/edit/question/${selectedQuestion._id}/option/${editedOption.id}`,
        {
          name: editedOption.name,
          tag: editedOption.tag,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
  
      if (response.status === 200) {
        const updatedQuestion = response.data.question; // Ensure backend sends updated question data
        toast.success(response.data.message);
        setSelectedQuestion(updatedQuestion); // Update state with updated question
      } else {
        toast.error(response.data.message || "Failed to update option");
      }
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating option:", error.message);
      toast.error("Failed to update option. Please try again.");
    }
  };

  const closeModal = () => {
    setIsEditModalOpen(false);
    setEditedQuestion("");
    setEditedOption({ id: "", name: "", tag: "" });
  };

  const handleModalClick = (e) => {
    if (e.target.id === "modalOverlay") {
      closeModal();
    }
  };

  const handleTextareaChange = (e) => {
    setEditedQuestion(e.target.value);
  };

  const handleOptionNameChange = (e) => {
    setEditedOption({
      ...editedOption,
      name: e.target.value,
    });
  };

  const handleOptionTagChange = (e) => {
    setEditedOption({
      ...editedOption,
      tag: e.target.value,
    });
  };

  const handleSaveChanges = () => {
    if (editedOption.id) {
      updateOption();
    } else {
      dispatch(editQuestion(selectedQuestion._id, editedQuestion));
      setIsEditModalOpen(false);
    }
  };

 return (
  <div className="question_box pt-14">
    <ProfileHead setSelectedQuestion={setSelectedQuestion} />

    {selectedQuestion ? (
      <div className="box relative flex flex-col mt-6 m-7 text-white-700 shadow-md bg-clip-border rounded-xl">
        <div className="p-6">
          <h5 className="heading block mb-2 font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-white-900">
            Q.{" "}
            <span dangerouslySetInnerHTML={{ __html: selectedQuestion.question }} />
            <button
              className="ml-2 text-blue-500"
              onClick={() => handleEditQuestion(selectedQuestion)}
            >
              <LuPencilLine />
            </button>
          </h5>
          {selectedQuestion.images && selectedQuestion.images.length > 0 && (
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
                      checked={option.tag === "Correct"}
                    />
                    <span
                      className="option-text"
                      dangerouslySetInnerHTML={{ __html: option.name }}
                    />
                    <button
                      className="ml-2 text-blue-500"
                      onClick={() => handleEditOption(option)}
                    >
                      <LuPencilLine />
                    </button>
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
          <p>
            Subtopics:{" "}
            {selectedQuestion.subtopics.length > 0
              ? selectedQuestion.subtopics.join(", ")
              : "N/A"}
          </p>
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

    {isEditModalOpen && (
      <div
        id="modalOverlay"
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={handleModalClick}
      >
        <div className="bg-white rounded-lg shadow-lg p-6 w-1/3 text-gray-900">
          <h3 className="text-xl mb-4">
            {editedOption.id ? "Edit Option" : "Edit Question"}
          </h3>
          {editedOption.id ? (
            <>
              <label className="block mb-2">Option Name:</label>
              <input
                type="text"
                className="w-full border border-gray-300 p-2 rounded mb-4"
                value={editedOption.name}
                onChange={handleOptionNameChange}
              />

              <label className="block mb-2">Option Tag:</label>
              <input
                type="text"
                className="w-full border border-gray-300 p-2 rounded mb-4"
                value={editedOption.tag}
                onChange={handleOptionTagChange}
              />
            </>
          ) : (
            <textarea
              className="w-full border border-gray-300 p-2 rounded mb-4"
              rows="5"
              value={editedQuestion}
              onChange={handleTextareaChange}
            />
          )}
          <div className="flex justify-end">
            <button
              className="bg-gray-500 text-white py-2 px-4 rounded mr-2"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded"
              onClick={handleSaveChanges}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )}

  </div>
);

};

export default Profile;
