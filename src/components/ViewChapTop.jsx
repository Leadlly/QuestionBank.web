import axios from "axios";
import { useState, useEffect } from "react";
import { server } from "../main";
import Loading from "../pages/Loading";
import { Select, Button } from "antd";

function getBadgeColor(examTag) {
  switch (examTag) {
    case "neet":
      return "green-500";
    case "jee":
      return "gray-500";
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
  const [TopicDetails, setTopicDetails] = useState({
    _id: "",
    standard: "",
    subjectName: "",
    chapterName: "",
    exam: [],
  });
  const [allTopics, setAllTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [showTopicPopup, setShowTopicPopup] = useState(false);

  const fetchTopics = async () => {
    setLoadingTopics(true);
    try {
      const response = await axios.get(`${server}/api/get/topic`, {
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
  const handleViewTopicClick = () => {
    fetchTopics();
    setShowTopicPopup(true);
  };
  const handleCloseTopicPopup = () => {
    setShowTopicPopup(false);
  };
  const fetchChapters = async () => {
    setLoadingChapters(true);
    try {
      const response = await axios.get(`${server}/api/get/chapter`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setAllChapters(response.data.chapters);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingChapters(false);
    }
  };

  useEffect(() => {
    fetchChapters();
    fetchTopics();
  }, []);

  const handleTopicClick = async (topicId) => {
    try {
      const response = await axios.get(`${server}/api/get/topic/${topicId}`);
      setShowTopicDetails(true);
      setTopicDetails((prevTopic) => ({
        ...prevTopic,
        _id: response.data.topic._id,
        standard: response.data.topic.standard,
        subjectName: response.data.topic.subjectName,
        chapterName: response.data.topic.chapterName,
        exam: response.data.topic.exam || [],
      }));
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
      setChapterDetails((prevChapter) => ({
        ...prevChapter,
        ...response.data.chapter,
        exam: response.data.chapter.exam || [],
      }));
    } catch (error) {
      console.error("Error retrieving chapter details:", error);
    }
  };

  const handleSaveChanges = async (event) => {
    event.preventDefault();
    try {
      const uniqueExamTags = [...new Set(chapterDetails.exam)];
      const response = await axios.post(
        `${server}/api/chapter/${chapterDetails._id}/examtag`,
        {
          examTags: uniqueExamTags,
        }
      );

      if (response.status === 200) {
        setShowChapterDetails(false);
        setAllChapters((prevChapters) =>
          prevChapters.map((chapter) =>
            chapter._id === chapterDetails._id
              ? { ...chapter, exam: [...new Set(chapterDetails.exam)] }
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
      const uniqueExamTags = [...new Set(TopicDetails.exam)];
      const response = await axios.post(
        `${server}/api/topic/${TopicDetails._id}/examtag`,
        {
          examTags: uniqueExamTags,
        }
      );

      if (response.status === 200) {
        setShowTopicDetails(false);
        setAllTopics((prevTopic) =>
          prevTopic.map((topic) =>
            topic._id === TopicDetails._id
              ? { ...topic, exam: [...new Set(TopicDetails.exam)] }
              : topic
          )
        );
      }
    } catch (error) {
      console.error("Error updating chapter exam tags:", error);
    }
  };

  const handleCloseChapterDetails = () => {
    setShowChapterDetails(false);
  };
  const handleCloseTopicDetails = () => {
    setShowTopicDetails(false);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      <div className="w-full max-w-md px-2 py-4 sm:px-2">
        <div className="flex space-x-4 mb-4">
          <Button
            type="primary"
            onClick={() => {
              setShowPopup(true);
              fetchChapters();
            }}
          >
            View Chapter
          </Button>
          <Button type="primary" onClick={handleViewTopicClick}>
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
                <div className="flex flex-wrap -mx-3 mb-6">
                  <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <label
                      className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                      htmlFor="exam"
                    >
                      Exam
                    </label>
                    <Select
                      mode="multiple"
                      style={{ width: "100%" }}
                      placeholder="Select Exam"
                      value={chapterDetails.exam}
                      filterOption={(input, option) =>
                        option.label.includes(input.toLowerCase())
                      }
                      onChange={(value) => {
                        const uniqueExamTags = [...new Set(value)]; // Remove duplicates here as well
                        setChapterDetails((prevChapter) => ({
                          ...prevChapter,
                          exam: uniqueExamTags,
                        }));
                      }}
                      options={[
                        { value: "jeemains", label: "JEE Mains" },
                        { value: "neet", label: "NEET" },
                        { value: "boards", label: "Boards" },
                      ]}
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button type="primary" htmlType="submit">
                    Save Changes
                  </Button>
                  <Button onClick={handleCloseChapterDetails}>Close</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showTopicPopup && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded p-4 w-1/2 h-3/4 overflow-y-auto">
              <Button
                type="primary"
                onClick={handleCloseTopicPopup}
                className="fixed top-4 right-8"
              >
                Close
              </Button>
              {loadingTopics ? (
                <Loading />
              ) : (
                <ul className="flex flex-wrap text-gray-900 cursor-pointer justify-center">
                  {allTopics.map((topic) => (
                    <li
                      key={topic._id}
                      className="bg-white rounded shadow-md p-4 w-48 mb-4 hover:bg-gray-100 transition duration-300 ease-in-out"
                      onClick={() => handleTopicClick(topic._id)}
                    >
                      <h5 className="text-lg font-bold">{topic.name}</h5>
                      {topic.exam && (
                        <div className="flex flex-wrap">
                          {topic.exam.map((examTag, index) => (
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
                      value={TopicDetails.standard}
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
                      value={TopicDetails.subjectName}
                      readOnly
                    />
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
                      value={TopicDetails.chapterName}
                      readOnly
                    />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                  <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <label
                      className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                      htmlFor="exam"
                    >
                      Exam
                    </label>
                    <Select
                      mode="multiple"
                      style={{ width: "100%" }}
                      placeholder="Select Exam"
                      value={TopicDetails.exam}
                      filterOption={(input, option) =>
                        option.label.includes(input.toLowerCase())
                      }
                      onChange={(value) => {
                        const uniqueExamTags = [...new Set(value)];
                        setTopicDetails((prevTopic) => ({
                          ...prevTopic,
                          exam: uniqueExamTags,
                        }));
                      }}
                      options={[
                        { value: "jeemains", label: "JEE Mains" },
                        { value: "neet", label: "NEET" },
                        { value: "boards", label: "Boards" },
                      ]}
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button type="primary" htmlType="submit">
                    Save Changes
                  </Button>
                  <Button onClick={handleCloseTopicDetails}>Close</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewChapTop;
