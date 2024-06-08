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

  const [options, setOptions] = useState([""]);
  const [correctOptions, setCorrectOptions] = useState([""]);
  const [isSubtopicsLoading, setIsSubtopicsLoading] = useState(false);

  const { subjectList } = useSelector((state) => state.getSubject);
  const { chapterList } = useSelector((state) => state.getChapter);
  const { topicList } = useSelector((state) => state.getTopic);
  const { subtopics } = useSelector((state) => state.getSubtopic);
  const { isLoading: questionLoading } = useSelector((state) => state.question);

  // console.log(optionImages, "optionimages");
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
      throw new Error("Failed to upload image to S3");
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {};
    for (const [name, value] of formData.entries()) {
      data[name] = value;
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
      question: data.question,
      options: filteredOptions.map((option, index) => ({
        name: option,
        image: formattedOptionImages[index] ? [formattedOptionImages[index]] : [],
        isCorrect: correctOptions.includes(index),
      })),
      images: formattedQuestionImage,
      standard,
      subject,
      chapter,
      topic,
      subtopics: selectedSubtopics[0]?.name || "",
      level,
      nestedSubTopic: selectedSubtopics
        .filter(({ subtopics }) => subtopics && subtopics.length > 0)
        .flatMap(({ subtopics }) =>
          subtopics
            .filter(({ isSelected }) => isSelected)
            .map(({ name }) => name)
        )
        .join(", "),
    };
  
    try {
      const response = await dispatch(createQuestion(formattedData));
  
      const { signedUrls, optionsSignedUrls } = response;
  
      // Upload question images
      const uploadQuestionImages = images.map((file, index) => {
        const signedUrl = signedUrls[index];
        return uploadImageToS3(file, signedUrl);
      });
  
      // Upload option images
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
      toast.error("Failed to create question. Please try again.");
    }
  };

  const handleInputChange = (index, event) => {
    const newOptions = [...options];
    newOptions[index] = event.target.value;

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
    updatedImages[index] = files[0]; // Replace the existing image with the new one
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
    document.getElementById("question").value = "";
    setOptions([""]);
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

    setSelectedSubtopics(updatedSubtopics.slice(0, level + 1));
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

    const selectedSubtopic = selectedSubtopics[level] || null;

    return (
      <div key={level} className="relative z-0 w-full mb-5 group flex flex-col">
        <label
          htmlFor={`subtopic-select-${level}`}
          className="block text-sm dark:text-white-400"
        >
          {level === 0 ? "Subtopic" : `Nested Subtopic`}
        </label>

        <Select
          id={`subtopic-select-${level}`}
          showSearch
          style={{ width: 200 }}
          placeholder={`Select ${level === 0 ? "Subtopic" : `Nested Subtopic`}`}
          options={currentSubtopics.map((subtopic) => ({
            value: subtopic.name,
            label: subtopic.name,
          }))}
          value={selectedSubtopic ? selectedSubtopic.name : null}
          onChange={(value) => handleSubtopicChange(value, level)}
        />

        {selectedSubtopic && selectedSubtopic.subtopics && (
          <div className="mt-5 mb-0">
            {renderSubtopicSelectors(selectedSubtopic.subtopics, level + 1)}
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="p-4">
      <h1 className="text-center m-10 text-white-600">Create Questions</h1>
      <form className="max-w-md mx-auto" onSubmit={handleFormSubmit}>
        <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
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
          <label className="text-white-500 text-sm dark:text-white-400">
            Standard
          </label>
        </div>

        <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select Subject"
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
          <label className="text-white-500 text-sm dark:text-white-400">
            Subject
          </label>
        </div>

        <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select Chapter"
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
          <label className="text-white-500 text-sm dark:text-white-400">
            Chapter
          </label>
        </div>

        <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select Topic"
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

        {topic && subtopics && subtopics.length > 0 && (
          <div>{renderSubtopicSelectors(subtopics, 0)}</div>
        )}

        <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select Level"
            onChange={(value) => setLevel(value)}
            value={level}
            options={[
              { value: "Basic", label: "Basic" },
              { value: "Boards", label: "Boards" },
              { value: "Neet", label: "Neet" },
              { value: "JeeMains", label: "JeeMains" },
              { value: "JeeAdvance", label: "JeeAdvance" },
            ]}
          />
          <label className="text-white-500 text-sm dark:text-white-400">
            Level
          </label>
        </div>

        <div className="relative z-0 w-full mb-5 group">
          <div className="relative flex items-center">
            <input
              type="text"
              name="question"
              id="question"
              className="block py-2.5 mb-2 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-white-300 appearance-none dark:text-white dark:border-white-600 dark:focus:border-white-500 focus:outline-none focus:ring-0 focus:border-white-600 peer"
              placeholder=" "
              required
            />
            <label
              htmlFor="question"
              className="peer-focus:font-medium absolute text-sm text-white-500 dark:text-white-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-grey-600 peer-focus:dark:text-grey-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
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
              <input
                type="text"
                name={`option-${index}`}
                value={option}
                onChange={(e) => handleInputChange(index, e)}
                className="block py-2.5 mb-2 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-white-300 appearance-none dark:text-white dark:border-white-600 dark:focus:border-white-500 focus:outline-none focus:ring-0 focus:border-white-600 peer"
                placeholder=" "
              />
              <label
                htmlFor={`option-${index}`}
                className="peer-focus:font-medium absolute text-sm text-white-500 dark:text-white-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-white-600 peer-focus:dark:text-white-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
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
          Add more options
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
