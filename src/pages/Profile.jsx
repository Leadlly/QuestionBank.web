import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteQuestion, editQuestion } from "../actions/questionAction";
import ProfileHead from "../components/ProfileHead";
import { LuPencilLine } from "react-icons/lu";
import { server } from "../main";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { animateScroll as scroll } from "react-scroll";
import EditModel from "../components/EditModel";

const Profile = () => {
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState("");
  const [editedOption, setEditedOption] = useState({ id: "", name: "", tag: "" });
  const [showSymbols, setShowSymbols] = useState(false);
  const [showOptionSymbols, setShowOptionSymbols] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.user);
  const { success: deleteSuccess, error: deleteError } = useSelector((state) => state.delete);
  const { success: editSuccess, error: editError } = useSelector((state) => state.editQuestion);
  const dispatch = useDispatch();
  const quillRef = useRef(null);
  const mathSymbols = [
    { symbol: '⁰', name: 'Numerator' },
    { symbol: '₁', name: 'Denominator' },
    { symbol: '/', name: 'Fraction' },
    { symbol: '∑', name: 'Summation' },
    { symbol: '∫', name: 'Integral' },
    { symbol: '√', name: 'Square Root' },
    { symbol: '∞', name: 'Infinity' },
    { symbol: 'π', name: 'Pi' },
    { symbol: 'α', name: 'Alpha' },
    { symbol: 'β', name: 'Beta' },
    { symbol: 'γ', name: 'Gamma' },
    { symbol: 'Δ', name: 'Delta' },
    { symbol: 'θ', name: 'Theta' },
    { symbol: 'λ', name: 'Lambda' },
    { symbol: 'μ', name: 'Mu' },
    { symbol: 'σ', name: 'Sigma' },
    { symbol: 'φ', name: 'Phi' },
    { symbol: 'ω', name: 'Omega' },
    { symbol: '∂', name: 'Partial Derivative' },
    { symbol: '±', name: 'Plus-Minus' },
    { symbol: '÷', name: 'Division' },
    { symbol: '×', name: 'Multiplication' },
    { symbol: '≠', name: 'Not Equal' },
    { symbol: '≈', name: 'Approximately Equal' },
    { symbol: '∝', name: 'Proportional To' },
    { symbol: '∈', name: 'Element Of' },
    { symbol: '∉', name: 'Not an Element Of' },
    { symbol: '∩', name: 'Intersection' },
    { symbol: '∪', name: 'Union' },
    { symbol: '∀', name: 'For All' },
    { symbol: '∃', name: 'There Exists' },
    { symbol: '∴', name: 'Therefore' },
    { symbol: '∵', name: 'Because' },
    { symbol: '⊂', name: 'Subset' },
    { symbol: '⊃', name: 'Superset' },
    { symbol: '⊆', name: 'Subset or Equal' },
    { symbol: '⊇', name: 'Superset or Equal' },
    { symbol: '⊥', name: 'Perpendicular' },
    { symbol: '⋅', name: 'Dot Product' },
    { symbol: '⊗', name: 'Tensor Product' },
    { symbol: '∇', name: 'Nabla (Del)' },
    { symbol: '⊕', name: 'Direct Sum' },
    { symbol: '⊖', name: 'Circled Minus' },
    { symbol: '⊙', name: 'Circled Dot' },
    { symbol: '⊘', name: 'Circled Slash' },
    { symbol: '⊚', name: 'Circled Ring' },
    { symbol: '∟', name: 'Right Angle' },
    { symbol: '∘', name: 'Function Composition' },
    { symbol: 'ℵ', name: 'Aleph' },
    { symbol: 'ℶ', name: 'Beth' },
    { symbol: 'ℷ', name: 'Gimel' },
    { symbol: 'ℸ', name: 'Dalet' },
    { symbol: '⊈', name: 'Not a Subset' },
    { symbol: '⊉', name: 'Not a Superset' },
    { symbol: '∥', name: 'Parallel' },
    { symbol: '∦', name: 'Not Parallel' },
    { symbol: '⊢', name: 'Right Tack' },
    { symbol: '⊣', name: 'Left Tack' },
    { symbol: '⊨', name: 'Double Right Tack' },
    { symbol: '⊭', name: 'Not Double Right Tack' },
    { symbol: '⊬', name: 'Not Right Tack' },
    { symbol: '⊧', name: 'Models' },
    { symbol: '⊩', name: 'Forces' },
    { symbol: '⊪', name: 'Not Forces' },
    { symbol: '∣', name: 'Divides' },
    { symbol: '∤', name: 'Does Not Divide' },
    { symbol: '≡', name: 'Identical To' },
    { symbol: '≢', name: 'Not Identical To' },
    { symbol: '≣', name: 'Strictly Equivalent To' },
    { symbol: '≦', name: 'Less Than or Equal To' },
    { symbol: '≧', name: 'Greater Than or Equal To' },
    { symbol: '≪', name: 'Much Less Than' },
    { symbol: '≫', name: 'Much Greater Than' },
    { symbol: '≲', name: 'Less Than or Equivalent To' },
    { symbol: '≳', name: 'Greater Than or Equivalent To' },
    { symbol: '≍', name: 'Equivalently' },
    { symbol: '≉', name: 'Not Approximately Equal To' },
    { symbol: '∉', name: 'Not An Element Of' },
    { symbol: '⊛', name: 'Circled Asterisk' },
    { symbol: '⊜', name: 'Circled Equal' },
    { symbol: '⊝', name: 'Circled Dash' },
    { symbol: '⊞', name: 'Circled Plus' },
    { symbol: '⊟', name: 'Circled Minus' },
    { symbol: '⊠', name: 'Circled Times' },
    { symbol: '⊡', name: 'Circled Divide' },
    { symbol: '⊫', name: 'Triple Turnstile' },
  ];
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = () => {
    setIsModalOpen(true);
  };


  const handleSaveEdits = (updatedQuestion) => {
    setSelectedQuestion(updatedQuestion);
    setIsModalOpen(false);
  };

  const closeModals = () => {
    setIsModalOpen(false);
  };
  const insertSymbol = (symbol) => {
    setEditedQuestion((prev) => `${prev}${symbol}`);
    setShowSymbols(false);
  };

  const insertOptionSymbol = (symbol) => {
    setEditedOption((prev) => ({
      ...prev,
      name: `${prev.name}${symbol}`
    }));
    setShowOptionSymbols(false);
  };


  const renderMathSymbols = (insertFunc) => (
    <div className="overflow-y-auto h-32 border bg-white text-gray-900 border-gray-300 rounded p-2">
      <ol className="space-y-0 flex flex-wrap gap-2">
        {mathSymbols.map((item) => (
          <li key={item.symbol}>
            <button onClick={() => insertFunc(item.symbol)} className="p-2 rounded border border-gray-400 hover:bg-gray-200">
              {item.symbol}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );


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
          if (selectedQuestion && selectedQuestion._id === id) {
            setSelectedQuestion(null);
          }
        } else if (deleteError) {
          toast.error(deleteError);
        }
      }, 500);
    }
  };

  const handleEditQuestion = (question) => {
    setEditedQuestion(question.question);
    setSelectedQuestion(question);
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
        const updatedQuestion = response.data.question;
        toast.success(response.data.message);
        setSelectedQuestion(updatedQuestion);
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

  const handleTextareaChange = (value) => {
    setEditedQuestion(value);
  };

  const handleOptionNameChange = (value) => {
    setEditedOption({
      ...editedOption,
      name: value,
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

  const toBottom = () => {
    scroll.scrollToBottom({ delay: 0, duration: 0, behavior: 'smooth' });

  };

  return (
    <div className="question_box pt-14">
      <ProfileHead setSelectedQuestion={setSelectedQuestion} toBottom={toBottom} />

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
            <p>
              Topics: {selectedQuestion && selectedQuestion.topics ? selectedQuestion.topics.join(", ") : "No topics available"}
            </p>

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
            <button
              className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg bg-blue-700 text-white shadow-md shadow-blue-700/10 hover:shadow-lg hover:shadow-blue-700/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none"
              type="button"
              onClick={() => handleEdit(selectedQuestion)}
            >
              Edit
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
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 sm:w-2/3 md:w-1/2 lg:w-1/3 xl:w-1/4 text-gray-900">
            <h3 className="text-xl mb-4">
              {editedOption.id ? "Edit Option" : "Edit Question"}
            </h3>
            {editedOption.id ? (
              <>
                <label className="block mb-2">Option Name:</label>
                <button
                  type="button"
                  className="bg-gray-300 text-gray-800 p-2 rounded"
                  onClick={() => setShowOptionSymbols(!showOptionSymbols)}
                >
                  &#x221A;
                </button>
                {showOptionSymbols && renderMathSymbols(insertOptionSymbol)}
                <ReactQuill
                  ref={quillRef}
                  value={editedOption.name}
                  onChange={handleOptionNameChange}
                  theme="snow"
                  modules={{
                    toolbar: [
                      [{ 'font': [] }, { 'size': [] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'color': [] }, { 'background': [] }],
                      [{ 'script': 'sub' }, { 'script': 'super' }],
                      [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block'],
                      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                      [{ 'align': [] }],
                      ['link', 'formula'],
                    ],
                  }}
                />
                <label className="block mb-2 mt-4">Tag:</label>
                <select
                  className="border rounded-lg p-2 w-full"
                  value={editedOption.tag}
                  onChange={handleOptionTagChange}
                >
                  <option value="">Select Tag</option>
                  <option value="Correct">Correct</option>
                  <option value="InCorrect">InCorrect</option>
                </select>
              </>
            ) : (
              <>
                <label className="block mb-2">Question:</label>
                <button
                  type="button"
                  className="bg-gray-300 text-gray-800 p-2 rounded"
                  onClick={() => setShowSymbols(!showSymbols)}
                >
                  &#x221A;
                </button>
                {showSymbols && renderMathSymbols(insertSymbol)}
                <ReactQuill
                  ref={quillRef}
                  value={editedQuestion}
                  onChange={handleTextareaChange}
                  theme="snow"
                  modules={{
                    toolbar: [
                      [{ 'font': [] }, { 'size': [] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'color': [] }, { 'background': [] }],
                      [{ 'script': 'sub' }, { 'script': 'super' }],
                      [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block'],
                      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                      [{ 'align': [] }],
                      ['link', 'formula'],
                    ],
                  }}
                />
              </>
            )}
            <div className="mt-4 flex justify-end">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                onClick={handleSaveChanges}
              >
                Save
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
  {isModalOpen && (
        <EditModel
          isOpen={isModalOpen}
          onClose={closeModals}
          selectedQuestion={selectedQuestion}
          onSave={handleSaveEdits}
          setIsModalOpen={setIsEditModalOpen}
        />
      )}
    </div>
  );
};

export default Profile;
