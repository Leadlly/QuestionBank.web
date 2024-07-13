import axios from "axios";
import { useState, useEffect } from "react";
import { server } from "../main";
import Loading from "../pages/Loading";
import { standards } from "../components/Options";
import { Select, Button } from "antd";
import { getSubjects } from "../actions/subjectAction";
import { useDispatch, useSelector } from "react-redux";
// import { getChapters } from "../actions/chapterAction";
// import { getTopics } from "../actions/topicAction";
import {  AiOutlineClose, AiOutlineDelete, AiOutlineEdit, AiOutlineInfoCircle } from 'react-icons/ai';

function getBadgeColor(examTag) {
  switch (examTag) {
    case "neet":
      return "green-700";
    case "jeemains":
      return "yellow-900";
    case "boards":
      return "black";
    default:
      return "blue-500";
  }
}

const ViewChapTop = () => {
  const [allChapters, setAllChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showChapterDetails, setShowChapterDetails] = useState(false);
  const [chapterDetails, setChapterDetails] = useState({
    _id: "",
    standard: "",
    subject: "",
    exam: [],
  });
  const [showTopicDetails, setShowTopicDetails] = useState(false);
  const [topicDetails, setTopicDetails] = useState({
    _id: "",
    standard: "",
    subjectName: "",
    chapterName: "",
    exam: [],
  });
  const [allTopics, setAllTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [showTopicPopup, setShowTopicPopup] = useState(false);

  const [selectedStandard, setSelectedStandard] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null); 
  const [editedName, setEditedName] = useState('');
  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.role === "admin";

  const handleEditTopic = (topic) => {
    setEditingTopic(topic);
    setEditedName(topic.name);
    
    setShowEditPopup(true);
  };
  
  const handleCloseEditPopup = () => {
    setShowEditPopup(false);
    setEditingTopic(null); 
    setEditedName(''); 
  };

  const { subjectList } = useSelector((state) => state.getSubject);
  // const { chapterList } = useSelector((state) => state.getChapter);

  const dispatch = useDispatch();
  useEffect(() => {
    if (selectedStandard) {
      dispatch(getSubjects(selectedStandard));
    }
  }, [dispatch, selectedStandard]);

    




  const handleViewTopicClick = () => {
    fetchTopics();
    setShowTopicPopup(true);
  };
  const handleViewChapterClick = () => {
    setShowPopup(true);
    fetchChapters();
  };

  
  const handleStandardChange = (value) => {
    console.log(value)
    setSelectedStandard(value);
    setSelectedSubject(""); 
    
  };
  
  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
    setSelectedChapter(""); 
    console.log("Selected Subject in handleSubjectChange:", value);
    fetchChapters(value);
  };
  
  const handleChapterChange = (value) => {
    setSelectedChapter(value)
  };

  const fetchChapters = async (selectedSubject) => {
    console.log("Selected Subject in fetchChapters:", selectedSubject);
    setLoadingChapters(true);
    try {
      const response = await axios.get(`${server}/api/get/chapter`, {
        params: {
          standard: selectedStandard,
          subjectName: selectedSubject,
        },
      }, {
        withCredentials: true,
      });
      if (response.data.success) {
        setAllChapters(response.data.chapters);
        console.log("All Chapters:", allChapters);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingChapters(false);
    }
  };
  
  const fetchTopics = async () => {
    setLoadingTopics(true);
    try {
      const response = await axios.get(`${server}/api/get/topic`, {
        params:{

          standard: selectedStandard,
          subjectName: selectedSubject,
          chapterName: selectedChapter,
        }
      }, {
        withCredentials: true,
      });
      if (response.data.success) {
        setAllTopics(response.data.topics);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleCloseTopicPopup = () => {
    setSelectedStandard("");
  setSelectedSubject("");
  setSelectedChapter("");
    setShowTopicPopup(false);
  };

  useEffect(() => {
    if (selectedStandard && selectedSubject && showPopup) {
      setLoadingChapters(true);
      fetchChapters();
    }
  }, [selectedStandard, selectedSubject, showPopup]);
  
  useEffect(() => {
    if (selectedStandard && selectedSubject && selectedChapter && showTopicPopup ) {
      setLoadingTopics(true);
      fetchTopics()
    }
  }, [selectedStandard, selectedSubject, selectedChapter, showTopicPopup]);

  const handleTopicClick = async (topicId) => {
    try {
      const response = await axios.get(`${server}/api/get/topic/${topicId}`);
      setShowTopicDetails(true);
      setTopicDetails({
        _id: response.data.topic._id,
        standard: response.data.topic.standard,
        subjectName: response.data.topic.subjectName,
        chapterName: response.data.topic.chapterName,
        exam: response.data.topic.exam || [],
      });
    } catch (error) {
      console.error("Error retrieving topic details:", error);
    }
  };

  const handleChapterClick = async (chapterId) => {
    try {
      const response = await axios.get(
        `${server}/api/get/chapter/${chapterId}`
      );
      setShowChapterDetails(true);
      setChapterDetails({
        _id: response.data.chapter._id,
        standard: response.data.chapter.standard,
        subjectName: response.data.chapter.subject,
        exam: response.data.chapter.exam || [],
      });
    } catch (error) {
      console.error("Error retrieving chapter details:", error);
    }
  };

  const handleSaveChanges = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.put(
        `${server}/api/chapter/${chapterDetails._id}/examtag`,
        {
          examTags: chapterDetails.exam,
        }
      );

      if (response.status === 200) {
        setShowChapterDetails(false);
        setAllChapters((prevChapters) =>
          prevChapters.map((chapter) =>
            chapter._id === chapterDetails._id
              ? { ...chapter, exam: chapterDetails.exam }
              : chapter
          )
        );
      }
    } catch (error) {
      console.error("Error updating chapter exam tags:", error);
    }
  };

  const handleSaveTopicChanges = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.put(
        `${server}/api/topic/${topicDetails._id}/examtag`,
        {
          examTags: topicDetails.exam,
        }
      );

      if (response.status === 200) {
        setShowTopicDetails(false);
        setAllTopics((prevTopic) =>
          prevTopic.map((topic) =>
            topic._id === topicDetails._id
              ? { ...topic, exam: topicDetails.exam }
              : topic
          )
        );
      }
    } catch (error) {
      console.error("Error updating topic exam tags:", error);
    }
  };

  const handleCloseChapterDetails = () => {
    setShowChapterDetails(false);
  };

  const handleCloseTopicDetails = () => {
    setShowTopicDetails(false);
  };

  const handleClosePopup = () => {
  setSelectedStandard("");
  setSelectedSubject("");
  setSelectedChapter("");
    setShowPopup(false);
  };

  const handleResetFilters = () => {
    setSelectedSubject("");
    setSelectedChapter("");
  }

  const handleSaveEditedTopic = async () => {
    try {
      const response = await axios.put(`${server}/api/edit/topic/${editingTopic._id}`, {
        name: editedName,
      });
  
      if (response.data.success) {
        setAllTopics((prevTopics) =>
          prevTopics.map((topic) =>
            topic._id === editingTopic._id ? { ...topic, name: editedName } : topic
          )
        );
        handleCloseEditPopup();
      } else {
        console.error("Error editing topic name:", response.data.error);
      }
    } catch (error) {
      console.error("Error editing topic:", error);
    }
  };

const handleDeleteTopic = async (topicId) => {
  try {
    const confirmDelete = window.confirm("Are you sure you want to delete this topic?");
    if (!confirmDelete) return;

    const response = await axios.delete(`${server}/api/delete/topic/${topicId}`);

    if (response.data.success) {
      setAllTopics((prevTopics) => prevTopics.filter((topic) => topic._id !== topicId));
      alert("Topic deleted successfully!");
    } else {
      alert("Error deleting topic. Please try again later.");
    }
  } catch (error) {
    console.error("Error deleting topic:", error);
  }
};
  return (
    <>
    {isAdmin? (
      <div className="w-full max-w-md px-2 py-4 sm:px-2">
      <div className="flex space-x-4 mb-4">
  <Button
    type="primary"
    onClick={handleViewChapterClick}
    className="bg-gradient-to-r border-blue-900 from-yellow-500 to-orange-500 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-2 px-4 rounded shadow-md"
  >
    View Chapter
  </Button>
  <Button
    type="primary"
    onClick={handleViewTopicClick}
    className="bg-gradient-to-r border-blue-600 from-blue-500 to-green-500 hover:from-blue-700 hover:to-green-700 border text-white font-bold py-2 px-4 rounded shadow-md"
  >
    View Topic
  </Button>
</div>

     

        {showPopup && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded p-4 w-1/2 h-3/4 overflow-y-auto">
              <Button
                type="primary"
                onClick={handleClosePopup}
                className="fixed top-4 right-8"
              >
                Close
              </Button>
               <div className="w-full max-w-md px-2 py-4 sm:px-2">
              <h2 className="text-center text-gray-900">View Chapters</h2>
             
 <div className="flex space-x-4 mb-4">
          <div className="w-1/2">
              <div className="mb-4">
                <label className="text-gray-500 text-sm dark:text-white-400">
                  Standard
                </label>
                <Select
                  style={{ width: 200 }}
                  showSearch
                  value={selectedStandard}
                  onChange={(value) => {
                    setSelectedStandard(value);
                    setSelectedSubject("");
                    setSelectedChapter("");
                  }}
                  options={standards.map((standard) => ({
                    value: standard.value,
                    label: standard.label,
                  }))}
                />
                </div>
                </div>
                 <div className="w-1/2">
            <div className="mb-4">
                <label className="text-gray-500 text-sm dark:text-white-400">
                  Subject
                </label>
                <Select
                  style={{ width: 200 }}
                  showSearch
                  value={selectedSubject}
                  onChange={(value) => {
                    setSelectedSubject(value);
                    setSelectedChapter("");
                  }}
                  filterOption={(input, option) =>
                    (option.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={subjectList?.map((name) => ({
                    value: name,
                    label: name,
                  }))}
                />
              </div>
              </div>
              </div>
              <div className="w-1/2 m-5">
            <button
              className=" border-green-600 border-2 p-2 bg-green-900 rounded-lg"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          </div>
          </div>
              {loadingChapters ? (
                <Loading />
              ) : (
                <ul className="flex flex-wrap text-gray-900 cursor-pointer justify-center">
                  {allChapters.map((chapter) => (
                    <li
                      key={chapter._id}
                      className="bg-white rounded shadow-md p-4 w-48 mb-4 hover:bg-gray-100 transition duration-300 ease-in-out"
                      onClick={() => handleChapterClick(chapter._id)}
                    >
                      <h5 className="text-lg font-bold">{chapter.name}</h5>
                      {chapter.exam && (
                        <div className="flex flex-wrap">
                          {chapter.exam.map((examTag, index) => (
                            <span
                              key={index}
                              className={`bg-${getBadgeColor(
                                examTag
                              )} text-sm m-2 text-white px-2 py-1 rounded-full ml-2`}
                            >
                              {examTag}
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {showChapterDetails && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded p-4 w-1/2 h-3/4 overflow-y-auto">
              <h4 className="text-lg font-bold mb-4">Chapter Details</h4>
              <form onSubmit={handleSaveChanges}>
                <div className="flex flex-wrap -mx-3 mb-6">
                  <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <label
                      className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                      htmlFor="standard"
                    >
                      Standard
                    </label>
                    <input
                      className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
                      id="standard"
                      type="text"
                      value={chapterDetails.standard}
                      readOnly
                    />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <label
                      className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                      htmlFor="subject"
                    >
                      Subject
                    </label>
                    <input
                      className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
                      id="subject"
                      type="text"
                      value={chapterDetails.subject}
                      readOnly
                    />
                  </div>
                </div>
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <label
                    className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    htmlFor="examTags"
                  >
                    Exam Tags
                  </label>
                  <Select
                    mode="multiple"
                    style={{ width: "100%" }}
                    placeholder="Select exam tags"
                    value={chapterDetails.exam}
                    onChange={(value) =>
                      setChapterDetails((prevChapter) => ({
                        ...prevChapter,
                        exam: value,
                      }))
                    }
                  >
                    <Select.Option key="neet">Neet</Select.Option>
                    <Select.Option key="jeemains">JeeMains</Select.Option>
                    <Select.Option key="boards">Boards</Select.Option>
                  </Select>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button type="primary" htmlType="submit">
                    Save
                  </Button>
                  <Button
                    type="default"
                    onClick={handleCloseChapterDetails}
                    className="ml-2"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

{showTopicPopup && (
  <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center z-40">
    <div className="bg-white rounded p-4 w-1/2 h-3/4 overflow-y-auto">
      <Button
        type="primary"
        onClick={handleCloseTopicPopup}
        className="fixed top-4 right-8"
      >
        Close
      </Button>
      <div className="w-full max-w-md px-2 py-4 sm:px-2">
        <h2 className="text-center text-gray-900 mb-4">View Topics</h2>
        <div className="flex space-x-4 mb-4">
          <div className="w-1/2">
            <div className="mb-4">
              <label className="text-gray-500 text-sm dark:text-white-400">
                Standard
              </label>
              <Select
                style={{ width: 200 }}
                showSearch
                value={selectedStandard}
                onChange={handleStandardChange}
                options={standards.map((standard) => ({
                  value: standard.value,
                  label: standard.label,
                }))}
              />
            </div>
            <div className="w-1/2">
              <div className="mb-4">
                <label className="text-gray-500 text-sm dark:text-white-400">
                  Subject
                </label>
                <Select
                  style={{ width: 200 }}
                  showSearch
                  value={selectedSubject}
                  onChange={handleSubjectChange}
                  filterOption={(input, option) =>
                    (option.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={subjectList?.map((name) => ({
                    value: name,
                    label: name,
                  }))}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-4 mb-4">
          <div className="w-1/2">
            <div className="mb-4">
              <label className="text-gray-500 text-sm dark:text-white-400">
                Chapter
              </label>
              <Select
                style={{ width: 200 }}
                showSearch
                value={selectedChapter}
                onChange={handleChapterChange}
                filterOption={(input, option) =>
                  (option.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={allChapters.map((chapter) => ({
                  value: chapter.name,
                  label: chapter.name,
                }))}
              />
            </div>
          </div>
        </div>
        <div className="w-1/2 m-5">
          <button
            className="border-green-600 border-2 p-2 bg-green-900 rounded-lg text-white"
            onClick={handleResetFilters}
          >
            Reset Filters
          </button>
        </div>

        
        {loadingTopics ? (
          <Loading />
        ) : (
          <ul className="flex flex-wrap text-gray-900 cursor-pointer justify-center">
            {allTopics.map((topic) => (
              <li
                key={topic._id}
                className="bg-white rounded shadow-md p-4 w-48 mb-4 hover:bg-gray-100 transition duration-300 ease-in-out"
              >
                 <div className="flex justify-end mt-2 space-x-2">
                  <Button
                    // type="primary"
                    onClick={() => handleEditTopic(topic)}
                  >
                     <AiOutlineEdit size={20} />
                  </Button>
                  <Button
                    type="danger"
                    onClick={() => handleDeleteTopic(topic._id)}
                  >
                    <AiOutlineDelete size={20} />
                  </Button>
                  <Button
                    type="info"
                    onClick={() => handleTopicClick(topic._id)}
                  >
                    <AiOutlineInfoCircle size={20} />
                  </Button>
                </div>
                <h5 className="text-lg font-bold">{topic.name}</h5>
                {topic.exam && (
                  <div className="flex flex-wrap">
                    {topic.exam.map((examTag, index) => (
                      <span
                        key={index}
                        className={`bg-${getBadgeColor(examTag)} text-sm m-2 text-white px-2 py-1 rounded-full ml-2`}
                      >
                        {examTag}
                      </span>
                    ))}
                  </div>
                )}
               
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

    {showEditPopup && editingTopic && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center z-60">
          <div className="bg-white rounded p-4 w-1/2 h-3/4 overflow-y-auto">
            <div className="flex justify-end">
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={handleCloseEditPopup}
              >
                <AiOutlineClose size={24} />
              </button>
            </div>
            <h2 className="text-center text-gray-900 mb-4">Edit Topic Name</h2>
            <div className="mb-4">
              <label className="text-gray-500 text-sm">Topic Name</label>
              <input
                type="text"
                className="border rounded-md text-gray-500 px-3 py-2 w-full mt-1"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />
            </div>
            <div className="flex justify-center">
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg mr-4"
                onClick={handleSaveEditedTopic}
              >
                Save
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                onClick={handleCloseEditPopup}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
  </div>

  
)}



        {showTopicDetails && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded p-4 w-1/2 h-3/4 overflow-y-auto">
              <h4 className="text-lg font-bold mb-4">Topic Details</h4>
              <form onSubmit={handleSaveTopicChanges}>
                <div className="flex flex-wrap -mx-3 mb-6">
                  <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <label
                      className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                      htmlFor="standard"
                    >
                      Standard
                    </label>
                    <input
                      className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
                      id="standard"
                      type="text"
                      value={topicDetails.standard}
                      readOnly
                    />
                  </div>
                  <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <label
                      className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                      htmlFor="subject"
                    >
                      Subject
                    </label>
                    <input
                      className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
                      id="subject"
                      type="text"
                      value={topicDetails.subjectName}
                      readOnly
                    />
                  </div>
                </div>
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <label
                    className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    htmlFor="chapter"
                  >
                    Chapter
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
                    id="chapter"
                    type="text"
                    value={topicDetails.chapterName}
                    readOnly
                  />
                </div>
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <label
                    className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    htmlFor="examTags"
                  >
                    Exam Tags
                  </label>
                  <Select
                    mode="multiple"
                    style={{ width: "100%" }}
                    placeholder="Select exam tags"
                    value={topicDetails.exam}
                    onChange={(value) =>
                      setTopicDetails((prevTopic) => ({
                        ...prevTopic,
                        exam: value,
                      }))
                    }
                  >
                    <Select.Option key="neet">Neet</Select.Option>
                    <Select.Option key="jeemains">JeeMains</Select.Option>
                    <Select.Option key="boards">Boards</Select.Option>
                  </Select>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button type="primary" htmlType="submit">
                    Save
                  </Button>
                  <Button
                    type="default"
                    onClick={handleCloseTopicDetails}
                    className="ml-2"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      ): (
        <div></div>
      )}
    </>
  );
};

export default ViewChapTop;
