import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select } from "antd";
import toast from "react-hot-toast";
import { createQuestion } from "../actions/questionAction";
import { getSubjects } from "../actions/subjectAction";
import { getChapters } from "../actions/chapterAction";
import { getTopics } from "../actions/topicAction";
import { getSubtopics } from "../actions/subtopicAction";
import { standards } from "../components/Options";
import Loading from "./Loading";
import { FaImage } from "react-icons/fa6";
import { ImCross } from "react-icons/im";
import { FaCheck } from "react-icons/fa";
import ReactQuill from "react-quill";
import "./CreateQuestion.css"
import "react-quill/dist/quill.snow.css";

const CreateQuestion = () => {
  const dispatch = useDispatch();

  const [standard, setStandard] = useState(null);
  const [subject, setSubject] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [topic, setTopic] = useState(null);
  const [level, setLevel] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedSubtopics, setSelectedSubtopics] = useState([]);
  const [optionImages, setOptionImages] = useState([]);
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState([""]);
  const [correctOptions, setCorrectOptions] = useState([""]);
  const [isSubtopicsLoading, setIsSubtopicsLoading] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);
  const { subjectList } = useSelector((state) => state.getSubject);
  const { chapterList } = useSelector((state) => state.getChapter);
  const { topicList } = useSelector((state) => state.getTopic);
  const { subtopics } = useSelector((state) => state.getSubtopic);
  const { isLoading: questionLoading } = useSelector((state) => state.question);


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
  

  const insertSymbol = (symbol) => {
    setQuestion((prev) => `${prev}${symbol}`);
    setShowSymbols(false);
  };

  const renderMathSymbols = () => (
    <div className="overflow-y-auto h-32 border bg-white text-gray-900 border-gray-300 rounded p-2">
      <ol className="space-y-0 flex flex-wrap gap-2">
        {mathSymbols.map((item) => (
          <li key={item.symbol}>
            <button onClick={() => insertSymbol(item.symbol)} className="p-2 rounded border border-gray-400 hover:bg-gray-200">
              {item.symbol}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
  
  
  
  useEffect(() => {
    if (standard) {
      dispatch(getSubjects(standard));
    }
    if (subject && standard) {
      dispatch(getChapters(subject, standard));
    }
    if (subject && standard && chapter) {
      dispatch(getTopics(subject, standard, chapter));
    }
    if (subject && standard && chapter && topic) {
      setIsSubtopicsLoading(true);
      dispatch(getSubtopics(subject, standard, chapter, topic))
        .then(() => {
          setIsSubtopicsLoading(false);
        })
        .catch(() => {
          setIsSubtopicsLoading(false);
        });
    } else {
      setIsSubtopicsLoading(false);
    }
  }, [dispatch, standard, subject, chapter, topic]);

  const uploadImageToS3 = async (file, signedUrl) => {
    const response = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!response.ok) {
      toast.error(`Image upload failed: ${file.name}`)
      throw new Error("Failed to upload image to S3");
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!question || !question.replace(/<[^>]*>/g, '').trim()) {
      toast.error("Question field is compulsory");
      return;
    }
  
    const filteredOptions = options.filter((option) => option.trim() !== "");
    const formattedQuestionImage = images.map((file) => ({
      name: file.name,
      type: file.type,
    }));
    const formattedOptionImages = optionImages.map((file) => ({
      name: file?.name,
      type: file?.type,
    }));
  
    const formattedData = {
      question: question,
      options: filteredOptions.map((option, index) => ({
        name: option,
        image: formattedOptionImages[index] ? [formattedOptionImages[index]] : [],
        isCorrect: correctOptions.includes(index),
      })),
      images: formattedQuestionImage,
      standard,
      subject,
      chapter,
      topics: topic,
      subtopics: selectedSubtopics,
      level,
      
    };
  
    try { 
       const hasCorrectOption = formattedData.options.some(
      (option) => option.isCorrect
    );
    if (!hasCorrectOption) {
      toast.error("At least one option must be correct.");
      return;
    }

      const response = await dispatch(createQuestion(formattedData));
  
      const { signedUrls, optionsSignedUrls } = response;
  
      const uploadQuestionImages = images.map((file, index) => {
        const signedUrl = signedUrls[index];
        return uploadImageToS3(file, signedUrl);
      });
  
      const uploadOptionImages = optionImages.map((file, index) => {
        const signedUrl = optionsSignedUrls[index];
        return uploadImageToS3(file, signedUrl);
      });
  
      await Promise.all([...uploadQuestionImages, ...uploadOptionImages]);
  
      if (response.success) {
        toast.success("Question added successfully!");
        resetFormFields();
      }

    } catch (error) {
      // toast.error("Failed to create question. Please try again.");
    }
  };

  const handleInputChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;

    if (newOptions[index].trim() !== "" && newOptions.length < 4) {
      newOptions.push("");
    }

    setOptions(newOptions);
  };
  const handleOptionSelect = (index) => {
    const newCorrectOptions = [...correctOptions];
    if (newCorrectOptions.includes(index)) {
      newCorrectOptions.splice(newCorrectOptions.indexOf(index), 1);
    } else {
      newCorrectOptions.splice(0, newCorrectOptions.length, index);
    }
    setCorrectOptions(newCorrectOptions);
  };
  const handleOptionImageUpload = (index, event) => {
    const files = Array.from(event.target.files);
    const updatedImages = [...optionImages];
    updatedImages[index] = files[0]; 
    setOptionImages(updatedImages);
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + images.length > 4) {
      alert("You can upload up to 4 images only.");
      return;
    }
    setImages([...images, ...files]);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const resetFormFields = () => {
    setQuestion("")
    setOptions([]);
    setCorrectOptions([""]);
    setIsSubtopicsLoading(false);
    setImages([]); // Clear question images
    setOptionImages([]); 
  };

  const handleSubtopicChange = (value, level) => {
    const updatedSubtopics = [...selectedSubtopics];
    const parentSubtopics =
      level === 0 ? subtopics : updatedSubtopics[level - 1].subtopics;

    const selectedSubtopic = parentSubtopics.find((sub) => sub.name === value);

    if (selectedSubtopic) {
      selectedSubtopic.isSelected = true;
      updatedSubtopics[level] = selectedSubtopic;
    }

    setSelectedSubtopics(value);
  };

  const handleRemoveOptionImage = (indexToRemove) => {
    setOptionImages((prevOptionImages) => {
      const updatedImages = [...prevOptionImages];
      updatedImages[indexToRemove] = null;
      return updatedImages;
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const renderSubtopicSelectors = (currentSubtopics, level) => {
    if (!currentSubtopics || currentSubtopics.length === 0) {
        return null;
    }


    return (
        <div key={level} className="relative z-0 w-full mb-5 group flex flex-col">
            <label
                htmlFor={`subtopic-select-${level}`}
                className="block text-sm dark:text-white-400"
            >
                {level === 0 ? "Subtopic" : `Nested Subtopic`}
            </label>

            <Select
                mode="multiple"
                id={`subtopic-select-${level}`}
                showSearch
                style={{ width: 200 }}
                placeholder={`Select ${level === 0 ? "Subtopic" : `Nested Subtopic`}`}
                filterOption={(input, option) =>
                  (option.label ?? "").toLowerCase().includes(input.toLowerCase())
               }
                options={currentSubtopics.map((subtopic) => ({
                    value: subtopic.name,
                    label: subtopic.name,
                }))}
                onChange={(value) => handleSubtopicChange(value, level)}
            />

            {currentSubtopics.map((subtopic) => (
                <div key={`${subtopic._id}-${level}`} className="mt-3 ml-6">
                    {renderSubtopicSelectors(subtopic.subtopics, level + 1)}
                </div>
            ))}
        </div>
    );
  }

  return (
    <main className="p-4">
      <h1 className="text-center m-10 text-white-600">Create Questions</h1>
      <form className="max-w-md mx-auto" onSubmit={handleFormSubmit}>
      <div className="flex flex-wrap gap-5 mb-5">

  <div className="relative z-0 w-full md:w-auto flex flex-col-reverse group">
    <Select
      showSearch
      style={{ width: 200 }}
      placeholder="Select Standard"
      onChange={(value) => {
        setStandard(value);
        setSubject(null);
        setChapter(null);
        setTopic(null);
        setSelectedSubtopics([]);
        setIsSubtopicsLoading(false);
      }}
      options={standards}
      value={standard}
    />
    <label className="text-white-500 text-sm dark:text-white-400 mt-1">
      Standard
    </label>
  </div>

  <div className="relative z-0 w-full md:w-auto flex flex-col-reverse group">
    <Select
      showSearch
      style={{ width: 200 }}
      placeholder="Select Subject"
      filterOption={(input, option) =>
        (option.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
      onChange={(value) => {
        setSubject(value);
        setChapter(null);
        setTopic(null);
        setSelectedSubtopics([]);
        setIsSubtopicsLoading(false);
      }}
      options={subjectList?.map((name) => ({
        value: name,
        label: name,
      }))}
      value={subject}
    />
    <label className="text-white-500 text-sm dark:text-white-400 mt-1">
      Subject
    </label>
  </div>

  <div className="relative z-0 w-full md:w-auto flex flex-col-reverse group">
    <Select
      mode="multiple"
      showSearch
      style={{ width: 200 }}
      placeholder="Select Chapter"
      filterOption={(input, option) =>
        (option.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
      onChange={(value) => {
        setChapter(value);
        setTopic(null);
        setSelectedSubtopics([]);
        setIsSubtopicsLoading(false);
      }}
      options={chapterList?.map((chapter) => ({
        value: chapter.name,
        label: chapter.name,
      }))}
      value={chapter}
    />
    <label className="text-white-500 text-sm dark:text-white-400 mt-1">
      Chapter
    </label>
  </div>

  <div className="relative z-0 w-full md:w-auto flex flex-col-reverse group">
    <Select
      mode="multiple"
      showSearch
      style={{ width: 200 }}
      placeholder="Select Topics"
      filterOption={(input, option) =>
        (option.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
      onChange={(value) => {
        setTopic(value);
        setSelectedSubtopics([]);
      }}
      options={topicList?.map((el) => ({
        value: el.name,
        label: el.name,
      }))}
      value={topic}
    />
    <label className="text-white-500 text-sm dark:text-white-400">
      Topic
    </label>
    {isSubtopicsLoading && (
      <div className="loader absolute top-0 right-0">
        <Loading />
      </div>
    )}
  </div>
  
</div>


        {topic && subtopics && subtopics.length > 0 && (
          <div>{renderSubtopicSelectors(subtopics, 0)}</div>
        )}

        <div className="relative z-0 w-full mb-8 group flex flex-col-reverse">
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select Level"
            filterOption={(input, option) =>
              (option.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
            onChange={(value) => setLevel(value)}
            value={level}
            options={[
              { value: "boards", label: "Boards" },
              { value: "neet", label: "Neet" },
              { value: "jeemains_easy", label: "JeeMains_Easy" },
              { value: "jeemains", label: "JeeMains" },
              { value: "jeeadvance", label: "JeeAdvance" },
            ]}
          />
          <label className="text-white-500 text-sm dark:text-white-400">
            Level
          </label>
        </div>

        <div className="relative z-0 w-full mb-5 group">
          <div className="relative flex items-center">
           
          <div className="mt-5">
          <button
                type="button"
                onClick={() => setShowSymbols((prev) => !prev)}
                className="symbol-btn"
              >
                ∑
              </button>
            {showSymbols &&
                       renderMathSymbols()}
              
              <ReactQuill
                value={question}
                 className=" bg-slate-50 text-black"
                onChange={setQuestion}
                theme="snow"
                modules={{
                  toolbar: [
                    [{ 'font': [] }, { 'size': [] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            [ { 'align': [] }],
            ['link','formula'],
                  ],
                }}
              />
              
            </div>
          

            <label
              htmlFor="question"
              className="peer-focus:font-medium absolute text-lg text-white-500 dark:text-white-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-grey-600 peer-focus:dark:text-grey-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Add Questions
            </label>
            <label htmlFor="imageUpload" className="cursor-pointer ml-2">
              <FaImage className="text-blue-500 dark:text-blue-400" />
              <span className="tooltip-text absolute bottom-full mb-2 w-max bg-black text-white text-xs rounded py-1 px-2 opacity-0 transition-opacity duration-300">
                Upload images
              </span>
            </label>
            <input
              type="file"
              id="imageUpload"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
            />
             
          </div>
          {images.map((image, index) => (
            <div key={index} className="relative inline-block">
              <img
                src={URL.createObjectURL(image)}
                alt={`upload-${index}`}
                className="w-60 h-60 object-cover mr-2 mb-2"
              />
              <button
                className="absolute top-4 right-6 transform translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1"
                onClick={() => handleRemoveImage(index)}
              >
                <ImCross className="text-red-500" />
              </button>
            </div>
          ))}
       </div>

        {options.map((option, index) => (
          <div key={index} className="relative z-0 w-full mb-5 group">
            <div className="flex items-center">
              {/* <input
                type="text"
                name={`option-${index}`}
                value={option}
                onChange={(e) => handleInputChange(index, e)}
                className="block py-2.5 mb-2 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-white-300 appearance-none dark:text-white dark:border-white-600 dark:focus:border-white-500 focus:outline-none focus:ring-0 focus:border-white-600 peer"
                placeholder=" "
              /> */}

            <div className="mt-5">
            <button
                type="button"
                onClick={() => setShowSymbols((prev) => !prev)}
                className="symbol-btn"
              >
                ∑
              </button>
            {showSymbols &&
                       renderMathSymbols()}
            <ReactQuill
            theme="snow"
            className=" bg-slate-200 text-black"
            value={option}
            onChange={(value) => handleInputChange(index, value)}
            modules={{
              toolbar: [
                ["bold", "italic", "underline", "strike", "blockquote"],
                ["link"],
                // ["clean"],
                [{ script: "sub" }, { script: "super" }], // Subscript and superscript
              ],
            }}
          
          />
          </div>
              <label
                htmlFor={`option-${index}`}
                className="peer-focus:font-medium absolute text-lg text-white-500 dark:text-white-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-white-600 peer-focus:dark:text-white-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Option {index + 1}
              </label>
              <label
                htmlFor={`optionImageUpload-${index}`}
                className="cursor-pointer ml-2"
              >
                <FaImage className="text-blue-500 dark:text-blue-400" />
                <span className="tooltip-text absolute bottom-full mb-2 w-max bg-black text-white text-xs rounded py-1 px-2 opacity-0 transition-opacity duration-300">
                  Upload images
                </span>
              </label>
              <input
                type="file"
                id={`optionImageUpload-${index}`}
                className="hidden"
                accept="image/*"
                onChange={(event) => handleOptionImageUpload(index, event)}
              />
              <div
                className={`ml-2 w-4 h-4 rounded-sm ${
                  correctOptions.includes(index)
                    ? "bg-blue-500"
                    : "bg-white-300"
                } flex items-center justify-center cursor-pointer border border-gray-300 hover:border-blue-500`}
                onClick={() => handleOptionSelect(index)}
              >
                {correctOptions.includes(index) && (
                  <FaCheck className="text-white" />
                )}
              </div>
            </div>
            {optionImages[index] && optionImages[index] !== null && (
              <div
                key={`option-image-${index}`}
                className="relative inline-block"
              >
                <img
                  src={URL.createObjectURL(optionImages[index])}
                  alt={`Option ${index}`}
                  className="w-60 h-60 object-cover mr-2 mb-2"
                />
                <button
                  type="button"
                  className="absolute top-4 right-6 transform translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1"
                  onClick={() => handleRemoveOptionImage(index)}
                >
                  <ImCross className="text-red-500" />
                </button>
              </div>
            )}
          </div>
        ))}
        <div
          className="border text-white-600 mb-10 rounded-xl h-10 text-sm flex items-center justify-center cursor-pointer"
          onClick={addOption}
        >
          Add options
        </div>

        {questionLoading ? (
          <button
            type="submit"
            disabled
            className="text-white bg-white-500 hover:bg-white-800 focus:ring-4 focus:outline-none focus:ring-white-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-white-600 dark:hover:bg-white-700 dark:focus:ring-white-800"
          >
            Submit
          </button>
        ) : (
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-white-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-white-600 dark:hover:bg-white-700 dark:focus:ring-white-800"
          >
            Submit
          </button>
        )}
      </form>
    </main>
  );
};

export default CreateQuestion;
