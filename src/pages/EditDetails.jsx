import { useEffect, useState } from "react";
import axios from "axios";
import "./EditDetails.css";
import { Input, Modal, Select, InputNumber, Form, message } from "antd";
import { server } from "../main";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import Loading from "./Loading";
import { FaEdit, FaTrashAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";

const EditDetails = () => {
  const [standard, setStandard] = useState("11");
  const [subjectList, setSubjectList] = useState([]);
  const [chaptersBySubject, setChaptersBySubject] = useState({});
  const [topicsByChapter, setTopicsByChapter] = useState({});
  const [subTopicByTopics, setSubTopicByTopics] = useState({});
  const [loadingTopics, setLoadingTopics] = useState({});
  const [loadingSubtopics, setLoadingSubtopics] = useState({});
  const [visibleChapters, setVisibleChapters] = useState({});
  const [visibleTopics, setVisibleTopics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubtopicModalOpen, setIsSubtopicModalOpen] = useState(false);
  const [currentTopicId, setCurrentTopicId] = useState(null);
  const [newTopicName, setNewTopicName] = useState("");
  const [currentSubtopicId, setCurrentSubtopicId] = useState(null);
  const [newSubtopicName, setNewSubtopicName] = useState("");
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [newChapterName, setNewChapterName] = useState("");
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [newChapterNumber, setNewChapterNumber] = useState(null);
  const [newTopicNumber, setNewTopicNumber] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
  
        const subjectsResponse = await axios.get(
          `${server}/api/get/subject?standard=${standard}`
        );
  
        const subjects = subjectsResponse.data.subjectList || [];
        setSubjectList(subjects);
  
        const chaptersPromises = subjects.map((subject) =>
          axios.get(
            `${server}/api/get/chapter?subjectName=${subject}&standard=${standard}`
          )
        );
  
        const chaptersResponses = await Promise.all(chaptersPromises);
  
        const chaptersData = {};
        chaptersResponses.forEach((response, index) => {
          const subject = subjects[index];
          const chapters = response.data.chapters || [];
  
          // Sort chapters by chapterNumber
          chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
  
          chaptersData[subject] = chapters;
        });
  
        setChaptersBySubject(chaptersData);
      } catch (error) {
        setError(error.message);
        console.error("Fetch Data Error:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [standard]);
  

  const fetchTopics = async (subjectName, chapterId) => {

    try {
      setLoadingTopics((prev) => ({ ...prev, [chapterId]: true }));

      const response = await axios.get(
        `${server}/api/get/topic?subjectName=${subjectName}&standard=${standard}&chapterId=${chapterId}`
      );

      setTopicsByChapter((prev) => ({
        ...prev,
        [chapterId]: response.data.topics || [],
      }));
    } catch (error) {
      console.error("Error fetching topics:", error.message);
    } finally {
      setLoadingTopics((prev) => ({ ...prev, [chapterId]: false }));
    }
  };

  const handleChapterClick = (subjectName, chapterId) => {
    if (!topicsByChapter[chapterId]) {
      fetchTopics(subjectName, chapterId);
    }

    setVisibleChapters((prev) => {
      const updatedChapters = {
        ...prev,
        [chapterId]: !prev[chapterId],
      };
      return updatedChapters;
    });
  };


  const fetchSubTopics = async (
    subjectName,
    chapterId, // Change to chapterId
    topicId,    // Keep topicId
    topicName
  ) => {
    try {
      setLoadingSubtopics((prev) => ({ ...prev, [topicId]: true }));

      const response = await axios.get(
        `${server}/api/get/subtopic?subjectName=${subjectName}&standard=${standard}&chapterId=${chapterId}&topicId=${topicId}` // Use chapterId and topicId
      );

      setSubTopicByTopics((prev) => ({
        ...prev,
        [topicId]: response.data.subtopics || [], // Store subtopics using topicId
      }));
    } catch (error) {
      console.error("Error fetching subtopics:", error.message);
    } finally {
      setLoadingSubtopics((prev) => ({ ...prev, [topicId]: false }));
    }
  };


  const handleTopicClick = (subjectName, chapterId, topicId, topicName) => {
    if (!subTopicByTopics[topicId]) {
      fetchSubTopics(subjectName, chapterId, topicId, topicName);
    }

    setVisibleTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };


  const handleUpdateTopic = async () => {
    try {
      // Ensure both topicId and newTopicName are provided
      if (!currentTopicId || !newTopicName) {
        toast.error("Topic ID and new name must be provided");
        return;
      }

      // API request to update the topic name
      const response = await axios.put(
        `${server}/api/update/topic/${currentTopicId}`,
        { name: newTopicName }
      );

      if (response.data.success) {
        toast.success("Topic name updated successfully");
        // Update the local state to reflect the changes
        setTopicsByChapter((prev) => {
          const updatedChapters = { ...prev };
          Object.keys(updatedChapters).forEach((chapter) => {
            updatedChapters[chapter] = updatedChapters[chapter].map((topic) =>
              topic._id === currentTopicId
                ? { ...topic, name: newTopicName }
                : topic
            );
          });
          return updatedChapters;
        });
      } else {
        toast.error(response.data.message || "Failed to update topic name");
      }
    } catch (error) {
      console.error("Error in handleUpdateTopic:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsModalOpen(false); // Close the modal after the update
    }
  };
  const handleTopicNumber = async () => {
    try {
      console.log("Current Topic ID:", currentTopicId);
      console.log("New Topic Number:", newTopicNumber);
  
      if (!currentTopicId || newTopicNumber === null) {
        message.error("Topic ID and Topic Number must be provided.");
        return;
      }
  
      let derivedChapterId = null;
  
      Object.keys(topicsByChapter).forEach((chapterKey) => {
        const topic = topicsByChapter[chapterKey].find(
          (t) => t._id === currentTopicId
        );
        if (topic) {
          derivedChapterId = chapterKey;
        }
      });
  
      console.log("Derived Chapter ID:", derivedChapterId);
  
      if (!derivedChapterId) {
        message.error("Failed to determine the Chapter ID from topics.");
        return;
      }
  
      const payload = {
        topicId: currentTopicId,
        newTopicNumber: newTopicNumber,
        chapterId: derivedChapterId,
      };
  
      console.log("Payload:", payload);
  
      const response = await axios.post(`${server}/api/update/topicnumber`, payload);
  
      if (response.status === 200) {
        message.success("Topic number updated successfully!");
  
        setTopicsByChapter((prev) => {
          const updatedChapters = { ...prev };
        
          // Update the specific topic and sort by topicNumber
          updatedChapters[derivedChapterId] = updatedChapters[derivedChapterId]
            .map((topic) =>
              topic._id === currentTopicId
                ? { ...topic, topicNumber: newTopicNumber }
                : topic
            )
            .sort((a, b) => {
              // If topicNumber is null, treat it as greater than any number
              if (a.topicNumber === null) return 1;
              if (b.topicNumber === null) return -1;
              return a.topicNumber - b.topicNumber; // Normal ascending order
            });
        
          return updatedChapters;
        });
        
      } else {
        message.error(response.data.message || "Failed to update topic number.");
      }
    } catch (error) {
      console.error("Error in handleTopicNumber:", error);
      const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
      message.error(errorMessage);
    }
  };
  
  
  
  
  const handleTopicUpdate = () => {
    if (newTopicName) handleUpdateTopic();
    if (newTopicNumber !== null) handleTopicNumber();
  };

  const openEditModal = (topicId, topicName, topicNumber) => {
    setCurrentTopicId(topicId);
    setNewTopicName(topicName);
    setNewTopicNumber(topicNumber)
    setIsModalOpen(true);
  };
  const handleDeleteTopic = (topicId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this topic?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(
            `${server}/api/delete/null/topic/${topicId}`
          );

          if (response.data.success) {
            toast.success("Topic deleted successfully");
            setTopicsByChapter((prev) => {
              const updatedChapters = { ...prev };
              Object.keys(updatedChapters).forEach((chapter) => {
                updatedChapters[chapter] = updatedChapters[chapter].filter(
                  (topic) => topic._id !== topicId
                );
              });
              return updatedChapters;
            });
          } else {
            toast.error(response.data.message || "Failed to delete topic");
          }
        } catch (error) {
          console.error("Error in handleDeleteTopic:", error);
          const errorMessage =
            error.response?.data?.message ||
            "An unexpected error occurred. Please try again later.";
          toast.error(errorMessage);
        }
      },
    });
  };

  const handleUpdateSubtopic = async () => {
    try {
      if (!currentSubtopicId || !newSubtopicName) {
        toast.error("Subtopic ID and new name must be provided");
        return;
      }

      const response = await axios.put(
        `${server}/api/update/subtopic/${currentSubtopicId}`,
        { name: newSubtopicName }
      );

      if (response.data.success) {
        toast.success("Subtopic name updated successfully");

        setSubTopicByTopics((prev) => {
          const updatedTopics = { ...prev };
          Object.keys(updatedTopics).forEach((topic) => {
            updatedTopics[topic] = updatedTopics[topic].map((subtopic) =>
              subtopic._id === currentSubtopicId
                ? { ...subtopic, name: newSubtopicName }
                : subtopic
            );
          });
          return updatedTopics;
        });
      } else {
        toast.error(response.data.message || "Failed to update subtopic name");
      }
    } catch (error) {
      console.error("Error in handleUpdateSubtopic:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubtopicModalOpen(false);
    }
  };

  const openEditSubtopicModal = (subtopicId, subtopicName) => {
    setCurrentSubtopicId(subtopicId);
    setNewSubtopicName(subtopicName);
    setIsSubtopicModalOpen(true);
  };

  const handleDeleteSubtopic = (subtopicId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this subtopic?",
      content:
        "This action cannot be undone. If this subtopic is associated with any questions, it cannot be deleted.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(
            `${server}/api/delete/subtopic/${subtopicId}`
          );

          if (response.data.success) {
            toast.success("Subtopic deleted successfully");

            setSubTopicByTopics((prev) => {
              const updatedTopics = { ...prev };
              Object.keys(updatedTopics).forEach((topic) => {
                updatedTopics[topic] = updatedTopics[topic].filter(
                  (subtopic) => subtopic._id !== subtopicId
                );
              });
              return updatedTopics;
            });
          } else {
            toast.error(response.data.message || "Failed to delete subtopic");
          }
        } catch (error) {
          console.error("Error in handleDeleteSubtopic:", error);
          const errorMessage =
            error.response?.data?.message ||
            "An unexpected error occurred. Please try again later.";
          toast.error(errorMessage);
        }
      },
    });
  };

  const handleUpdateChapterName = async () => {
    try {
      if (!newChapterName) {
        message.error("Please provide a chapter name.");
        return;
      }

      const response = await axios.put(`${server}/api/update/chapter/${currentChapterId}`, {
        name: newChapterName,
      });

      if (response.data.success) {
        message.success("Chapter name updated successfully!");
        setChaptersBySubject((prev) => {
          const updatedChapters = { ...prev };
          Object.keys(updatedChapters).forEach((subject) => {
            updatedChapters[subject] = updatedChapters[subject].map((chapter) =>
              chapter._id === currentChapterId
                ? { ...chapter, name: newChapterName }
                : chapter
            );
          });
          return updatedChapters;
        });
        setIsChapterModalOpen(false);
      } else {
        message.error(response.data.message || "Failed to update chapter name.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred.";
      message.error(errorMessage);
    }
  };

  const handleChapterNumberUpdate = async () => {
    try {
      if (!currentChapterId || newChapterNumber === null) {
        message.error("Chapter ID and Chapter Number must be provided.");
        return;
      }
  
      let derivedSubjectName = null;
      Object.keys(chaptersBySubject).forEach((subjectKey) => {
        const chapter = chaptersBySubject[subjectKey].find(
          (chapter) => chapter._id === currentChapterId
        );
        if (chapter) {
          derivedSubjectName = subjectKey;
        }
      });
  
      if (!derivedSubjectName) {
        message.error("Failed to determine the subject name.");
        return;
      }
  
      const payload = {
        chapterId: currentChapterId,
        subjectName: derivedSubjectName,
        chapterNumber: newChapterNumber || null,
      };
  
      const response = await axios.post(`${server}/api/update/chapternumber`, payload);
  
      if (response.status === 200) {
        message.success("Chapter number updated successfully!");
  
        setChaptersBySubject((prev) => {
          const updatedChapters = { ...prev };
  
          updatedChapters[derivedSubjectName] = updatedChapters[
            derivedSubjectName
          ]
            .map((chapter) =>
              chapter._id === currentChapterId
                ? { ...chapter, chapterNumber: newChapterNumber }
                : chapter
            )
            .sort((a, b) => a.chapterNumber - b.chapterNumber); // Sort chapters by chapterNumber
  
          return updatedChapters;
        });
  
        setIsChapterModalOpen(false);
      } else {
        message.error(response.data.message || "Failed to update chapter number.");
      }
    } catch (error) {
      console.error("Error in handleChapterNumberUpdate:", error);
      const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
      message.error(errorMessage);
    }
  };
  


  const handleUpdate = () => {
    if (newChapterName) handleUpdateChapterName();
    if (newChapterNumber !== null) handleChapterNumberUpdate();
  };

  const openEditChapterModal = (chapterId, chapterName, chapterNumber) => {

    setCurrentChapterId(chapterId);
    setNewChapterName(chapterName);
    setNewChapterNumber(chapterNumber || "");
    setIsChapterModalOpen(true);
  };




  const handleDeleteChapter = (chapterId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this Chapter?",
      content:
        "This action cannot be undone. If this Chapter is associated with any questions, it cannot be deleted.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(
            `${server}/api/delete/chapter/${chapterId}`
          );

          if (response.data.success) {
            toast.success("Subtopic deleted successfully");

            setSubTopicByTopics((prev) => {
              const updatedTopics = { ...prev };
              Object.keys(updatedTopics).forEach((chapter) => {
                updatedTopics[chapter] = updatedTopics[chapter].filter(
                  (chapter) => chapter._id !== chapterId
                );
              });
              return updatedTopics;
            });
          } else {
            toast.error(response.data.message || "Failed to delete chapter");
          }
        } catch (error) {
          console.error("Error in handleDeleteChapter:", error);
          const errorMessage =
            error.response?.data?.message ||
            "An unexpected error occurred. Please try again later.";
          toast.error(errorMessage);
        }
      },
    });
  };



  if (loading) {
    return <Loader />;
  }

  if (error) {
    return toast.error(error);
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="relative z-0 w-full mb-5 mt-12 group items-center flex flex-col-reverse">
        <Select
          showSearch
          style={{ width: 200 }}
          placeholder="Select Standard"
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label ?? "").includes(input)
          }
          onChange={(value) => setStandard(value)}
          options={[
            { label: "11", value: "11" },
            { label: "12", value: "12" },
          ]}
          value={standard}
        />
      </div>
      <div className="flex flex-wrap gap-4">
        {subjectList.length > 0 ? (
          subjectList.map((subject) => (
            <div
              key={subject}
              className="relative z-0 flex-shrink-0 w-48 md:w-auto"
            >
              <Select
                style={{ width: 200, backgroundColor: "#f5f5f5" }}
                value={subject}
                disabled
                className="custom-dark-text"
              />
              <hr />
              {Array.isArray(chaptersBySubject[subject]) &&
                chaptersBySubject[subject].length > 0 ? (
                <ul className="mt-2">
                  {chaptersBySubject[subject].map((chapter) => (
                    <li key={chapter._id} className="chapter-item">
                      <div className="flex items-center space-x-4">
  <span className="text-white-200 font-medium">{chapter.chapterNumber || "N/A"}.</span>
  <span className="flex-grow text-white-800 font-semibold">{chapter.name}</span>
                        <div className="flex items-center space-x-2 text-right">
                          <a
                            className="ml-2 cursor-pointer text-blue-500 custom-underline"
                            onClick={() =>
                              handleChapterClick(subject, chapter._id)
                            }
                          >
                            {visibleChapters[chapter._id] ? (
                              <FaChevronUp />
                            ) : (
                              <FaChevronDown />
                            )}
                          </a>
                          <FaEdit
                            className="cursor-pointer text-green-500"
                            onClick={() =>
                              openEditChapterModal(
                                chapter._id,
                                chapter.name,
                                chapter.chapterNumber || "N/A"
                              )
                            }
                          />
                          <FaTrashAlt
                            className="text-red-500 cursor-pointer"
                            onClick={() => handleDeleteChapter(chapter._id)}
                          />
                        </div>
                      </div>
                      {visibleChapters[chapter._id] && ( // Use chapter._id here as well
                        <div className="mt-2">
                          {loadingTopics[chapter._id] ? ( // Loading state using chapter._id
                            <Loading />
                          ) : (
                            <>
                              {Array.isArray(topicsByChapter[chapter._id]) && topicsByChapter[chapter._id].length > 0 ? (
                                <ul>
                                  {topicsByChapter[chapter._id].map((topic) => (
                                    <li key={topic._id} className="text-sm">
                                      <div className="flex items-center space-x-4">
                                        <span className="text-white-200 font-medium">{topic.topicNumber || "N/A"}.</span>
                                        <span className="flex-grow text-white-800 font-semibold">{topic.name}</span>
                                        <div className="flex items-center space-x-2 text-right">
                                          <a
                                            className="ml-2 cursor-pointer text-blue-500 custom-underline"
                                            onClick={() =>
                                              handleTopicClick(
                                                subject,
                                                chapter._id,
                                                topic._id,
                                                topic.name
                                              )
                                            }
                                          >
                                            {visibleTopics[topic._id] ? <FaChevronUp /> : <FaChevronDown />}
                                          </a>
                                          <FaEdit
                                            className="cursor-pointer text-green-500"
                                            onClick={() => openEditModal(topic._id, topic.name, topic.topicNumber || "N/A")}
                                          />
                                          <FaTrashAlt
                                            className="text-red-500 cursor-pointer"
                                            onClick={() => handleDeleteTopic(topic._id)}
                                          />
                                        </div>
                                      </div>
                                      {visibleTopics[topic._id] && (
                                        <div className="mt-2 mb-2 ml-4">
                                          {loadingSubtopics[topic._id] ? (
                                            <Loading />
                                          ) : (
                                            <>
                                              {subTopicByTopics[topic._id] && subTopicByTopics[topic._id].length > 0 ? (
                                                <ul>
                                                  {subTopicByTopics[topic._id].map((subtopic) => (
                                                    <li key={subtopic._id} className="text-xs flex justify-between items-center">
                                                      <span>{subtopic.name}</span>
                                                      <div className="flex space-x-2">
                                                        <FaEdit
                                                          className="cursor-pointer text-green-500"
                                                          onClick={() => openEditSubtopicModal(subtopic._id, subtopic.name)}
                                                        />
                                                        <FaTrashAlt
                                                          className="text-red-500 cursor-pointer"
                                                          onClick={() => handleDeleteSubtopic(subtopic._id)}
                                                        />
                                                      </div>
                                                    </li>
                                                  ))}
                                                </ul>
                                              ) : (
                                                <div className="text-xs">No subtopics available</div>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div>No topics available</div>
                              )}

                            </>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div>No chapters available</div>
              )}
            </div>
          ))
        ) : (
          <div>No subjects available</div>
        )}
      </div>
      <Modal
      title="Edit Topic Name"
      open={isSubtopicModalOpen}
      onOk={handleUpdateSubtopic}
      onCancel={() => setIsSubtopicModalOpen(false)}
      centered
        
      >
        <Input
          value={newTopicName}
          onChange={(e) => setNewSubtopicName(e.target.value)}
          placeholder="Enter new topic name"
        />
      </Modal>
      <Modal
        centered
        title="Edit Topic Name"
        open={isModalOpen}
        onOk={handleTopicUpdate}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form layout="vertical"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}>
          <Form.Item label="Topic Name"
            required
            rules={[{ required: true, message: "Topic name is required" }]}>
            <Input
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="Enter new Topic name"
              maxLength={50} />
          </Form.Item>
          <Form.Item
            label="Topic Number"
            required
            rules={[
              {
                required: true,
                message: "Topic number is required",
              },
              {
                type: "number",
                min: 1,
                max: 35,
                message: "Topic number must be between 1 and 35",
              },
            ]}
          >
            <InputNumber
              value={newTopicNumber} // Use newChapterNumber here
              onChange={(value) => setNewTopicNumber(value)} // Update newChapterNumber state
              placeholder="Enter topic number"
              min={1}
              max={35}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Edit Chapter Details"
        open={isChapterModalOpen}
        onOk={handleUpdate}
        onCancel={() => setIsChapterModalOpen(false)}
        centered
      >
        <Form
          layout="vertical"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <Form.Item
            label="Chapter Name"
            required
            rules={[{ required: true, message: "Chapter name is required" }]}
          >
            <Input
              value={newChapterName}
              onChange={(e) => setNewChapterName(e.target.value)}
              placeholder="Enter new chapter name"
              maxLength={50}
            />
          </Form.Item>
          <Form.Item
            label="Chapter Number"
            required
            rules={[
              {
                required: true,
                message: "Chapter number is required",
              },
              {
                type: "number",
                min: 1,
                max: 35,
                message: "Chapter number must be between 1 and 35",
              },
            ]}
          >
            <InputNumber
              value={newChapterNumber} // Use newChapterNumber here
              onChange={(value) => setNewChapterNumber(value)} // Update newChapterNumber state
              placeholder="Enter chapter number"
              min={1}
              max={35}
              style={{ width: "100%" }}
            />
          </Form.Item>

        </Form>
      </Modal>
    </div>
  );
};

export default EditDetails;
