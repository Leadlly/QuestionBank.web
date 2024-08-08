import { useEffect, useState } from "react";
import axios from "axios";
import "./EditDetails.css";
import { Button, Select } from "antd";
import { server } from "../main";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

const EditDetails = () => {
  const [standard, setStandard] = useState("12");
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
          chaptersData[subject] = response.data.chapters || [];
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

  const fetchTopics = async (subjectName, chapterName) => {
    try {
      setLoadingTopics((prev) => ({ ...prev, [chapterName]: true }));

      const response = await axios.get(
        `${server}/api/get/topic?subjectName=${subjectName}&standard=${standard}&chapterName=${chapterName}`
      );
      
      setTopicsByChapter((prev) => ({
        ...prev,
        [chapterName]: response.data.topics || [],
      }));
    } catch (error) {
      console.error("Error fetching topics:", error.message);
    } finally {
      setLoadingTopics((prev) => ({ ...prev, [chapterName]: false }));
    }
  };

  const handleChapterClick = (subjectName, chapterName) => {
    if (!topicsByChapter[chapterName]) {
      fetchTopics(subjectName, chapterName);
    }
    setVisibleChapters((prev) => ({
      ...prev,
      [chapterName]: !prev[chapterName],
    }));
  };

  const fetchSubTopics = async (subjectName, chapterName, topicId, topicName) => {
    try {
      setLoadingSubtopics((prev) => ({ ...prev, [topicId]: true }));

      const response = await axios.get(
        `${server}/api/get/subtopic?subjectName=${subjectName}&standard=${standard}&chapterName=${chapterName}&topicName=${topicName}`
      );

      setSubTopicByTopics((prev) => ({
        ...prev,
        [topicId]: response.data.subtopics || [],
      }));
    } catch (error) {
      console.error("Error fetching subtopics:", error.message);
    } finally {
      setLoadingSubtopics((prev) => ({ ...prev, [topicId]: false }));
    }
  };

  const handleTopicClick = (subjectName, chapterName, topicId, topicName) => {
    if (!subTopicByTopics[topicId]) {
      fetchSubTopics(subjectName, chapterName, topicId, topicName);
    }
    setVisibleTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return toast.error(error);
  }

  return (
    <div className="flex flex-col justify-center items-center pt-40 px-4">
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
        />
      </div>
      <div className="flex flex-wrap gap-4">
        {subjectList.length > 0 ? (
          subjectList.map((subject) => (
            <div key={subject} className="relative z-0 flex-shrink-0 w-48 md:w-auto">
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
                      <div className="flex justify-between items-center">
                        <span>{chapter.name}</span>
                        <Button
                          className="ml-2"
                          onClick={() =>
                            handleChapterClick(subject, chapter.name)
                          }
                        >
                          {visibleChapters[chapter.name]
                            ? "Hide Topics"
                            : "Show Topics"}
                        </Button>
                      </div>
                      {visibleChapters[chapter.name] && (
                        <div className="mt-2">
                          {loadingTopics[chapter.name] ? (
                            <p>Loading...</p>
                          ) : (
                            <>
                              {Array.isArray(topicsByChapter[chapter.name]) &&
                              topicsByChapter[chapter.name].length > 0 ? (
                                <ul>
                                  {topicsByChapter[chapter.name].map((topic) => (
                                    <li key={topic._id} className="text-sm">
                                      <div className="flex justify-between items-center">
                                        <strong>{topic.name}</strong>
                                        <Button
                                          className="ml-2"
                                          onClick={() =>
                                            handleTopicClick(
                                              subject,
                                              chapter.name,
                                              topic._id,
                                              topic.name
                                            )
                                          }
                                        >
                                          {visibleTopics[topic._id]
                                            ? "Hide Subtopics"
                                            : "Show Subtopics"}
                                        </Button>
                                      </div>
                                      {visibleTopics[topic._id] && (
                                        <div className="mt-2 ml-4">
                                          {loadingSubtopics[topic._id] ? (
                                            <h2>Loading...</h2>
                                          ) : (
                                            <>
                                              {subTopicByTopics[topic._id] &&
                                              subTopicByTopics[topic._id].length > 0 ? (
                                                <ul>
                                                  {subTopicByTopics[topic._id].map((subtopic) => (
                                                    <li key={subtopic._id} className="text-xs">
                                                      {subtopic.name}
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
    </div>
  );
};

export default EditDetails;
