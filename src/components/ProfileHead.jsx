import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Tab } from "@headlessui/react";
import axios from "axios";
import classNames from "classnames";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Select } from "antd";
import { standards } from "../components/Options";
import { server } from "../main";
import "../styles/login.scss";

const ProfileHead = ({ setSelectedQuestion }) => {
  const [questions, setQuestions] = useState([]);
  const [myQuestions, setMyQuestions] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [mySubjects, setMySubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [myChapters, setMyChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [myTopics, setMyTopics] = useState([]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const { user } = useSelector((state) => state.user);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (selectedStandard) {
      if (activeTabIndex === 0) {
        fetchQuestions(selectedStandard, selectedSubject, selectedChapter, selectedTopic);
      } else if (activeTabIndex === 1) {
        fetchUserQuestions(selectedStandard, selectedSubject, selectedChapter, selectedTopic);
      }
    }
  }, [selectedStandard, selectedSubject, selectedChapter, selectedTopic, activeTabIndex]);


  const fetchQuestions = async (standard, subject, chapter, topic) => {
    try {
      const response = await axios.get(`${server}/api/get/question`, {
        params: { standard, subject, chapter, topic },
        withCredentials: true,
      });

      if (response.data.success) {
        const questions = response.data.questions;
        setQuestions(questions);

        const uniqueSubjects = Array.from(
          new Set(questions.map((q) => q.subject))
        );
        setSubjects(uniqueSubjects);

        const uniqueChapters = Array.from(
          new Set(questions.flatMap((q) => q.chapter))
        );
        setChapters(uniqueChapters);

        const uniqueTopics = Array.from(
          new Set(questions.flatMap((q) => q.topics))
        );
        setTopics(uniqueTopics);
      } else {
        setQuestions([]);
        setSubjects([]);
        setChapters([]);
        setTopics([]);
        toast.error(`No questions available for the selected standard.`);
      }
    } catch (error) {
      toast.error("Error fetching questions and subjects.");
      console.error(error);
    }
  };

  const fetchUserQuestions = async (standard, subject, chapter, topic) => {
    try {
      const response = await axios.get(`${server}/api/get/myquestion`, {
        params: { standard, subject, chapter, topic },
        withCredentials: true,
      });

      if (response.data.success) {
        const questions = response.data.questions;
        setMyQuestions(questions);

        const uniqueSubjects = Array.from(
          new Set(questions.map((q) => q.subject))
        );
        setMySubjects(uniqueSubjects);

        const uniqueChapters = Array.from(
          new Set(questions.flatMap((q) => q.chapter))
        );
        setMyChapters(uniqueChapters);

        const uniqueTopics = Array.from(
          new Set(questions.flatMap((q) => q.topics))
        );
        setMyTopics(uniqueTopics);
      } else {
        setMyQuestions([]);
        setMySubjects([]);
        setMyChapters([]);
        setMyTopics([]);
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error fetching questions.");
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      if (isAdmin) {
        const response = await axios.get(`${server}/api/get/users`, { withCredentials: true });
        if (response.data.success) {
          setUsers(response.data.users);
        } else {
          toast.error("Failed to fetch users.");
        }
      }
    } catch (error) {
      toast.error("Error fetching users.");
      console.error(error);
    }
  };
  

  useEffect(() => {
    fetchUsers();
  }, [isAdmin]);

  const handleTabChange = (index) => {
    setSelectedQuestion(null);
    setActiveTabIndex(index);

    // Reset selected fields
    setSelectedSubject("");
    setSelectedChapter("");
    setSelectedTopic("");

    // Clear data arrays
    setSubjects([]);
    setChapters([]);
    setTopics([]);
    setMySubjects([]);
    setMyChapters([]);
    setMyTopics([]);
    setQuestions([]);
    setMyQuestions([]);

    if (selectedStandard) {
      if (index === 0) {
        fetchQuestions(selectedStandard, selectedSubject, selectedChapter, selectedTopic);
      } else if (index === 1) {
        fetchUserQuestions(selectedStandard, selectedSubject, selectedChapter, selectedTopic);
      }
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      setActiveTabIndex(1);
    }
  }, [isAdmin]);

  useEffect(() => {
    setSelectedSubject("");
    setSelectedChapter("");
    setSelectedTopic("");
    setSubjects([]);
    setChapters([]);
    setTopics([]);
    setMySubjects([]);
    setMyChapters([]);
    setMyTopics([]);
    setQuestions([]);
    setMyQuestions([]);
  }, [user]);

  const filteredQuestions = selectedSubject
    ? questions.filter((question) => question.subject === selectedSubject)
    : questions;

  const filteredMyQuestions = selectedSubject
    ? myQuestions.filter((question) => question.subject === selectedSubject)
    : myQuestions;

  const handleUserChange = (value) => {
    setSelectedUser(value);
    fetchUserQuestions(selectedStandard, selectedSubject, selectedChapter, selectedTopic, value);
  };

  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
    setSelectedChapter("");
    setSelectedTopic("");

    if (activeTabIndex === 0) {
      fetchQuestions(selectedStandard, value);
    } else if (activeTabIndex === 1) {
      fetchUserQuestions(selectedStandard, value);
    }
  };

  const handleChapterChange = (value) => {
    setSelectedChapter(value);
    setSelectedTopic("");

    if (activeTabIndex === 0) {
      fetchQuestions(selectedStandard, selectedSubject, value);
    } else if (activeTabIndex === 1) {
      fetchUserQuestions(selectedStandard, selectedSubject, value);
    }
  };

  const handleTopicChange = (value) => {
    setSelectedTopic(value);

    if (activeTabIndex === 0) {
      fetchQuestions(selectedStandard, selectedSubject, selectedChapter, value);
    } else if (activeTabIndex === 1) {
      fetchUserQuestions(selectedStandard, selectedSubject, selectedChapter, value);
    }
  };

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
  };

  return (
    <div className="w-full max-w-md px-2 py-4 sm:px-2">

      <div className="flex space-x-4 mb-4">
       
        <div className="w-1/2">
          <div className="mb-4">
            <label className="text-white-500 text-sm dark:text-white-400">
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
                setSelectedTopic("");
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
            <label className="text-white-500 text-sm dark:text-white-400">
              Subject
            </label>
            <Select
              style={{ width: 200 }}
              showSearch
              value={selectedSubject}
              onChange={handleSubjectChange}
              filterOption={(input, option) =>
                (option.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={
                activeTabIndex === 1
                  ? mySubjects.map((subject) => ({
                      value: subject,
                      label: subject,
                    }))
                  : subjects.map((subject) => ({
                      value: subject,
                      label: subject,
                    }))
              }
            />
          </div>
        </div>
      </div>
      <div className="flex space-x-4 mb-4">
        <div className="w-1/2">
          <div className="mb-4">
            <label className="text-white-500 text-sm dark:text-white-400">
              Chapter
            </label>
            <Select
              style={{ width: 200 }}
              showSearch
              value={selectedChapter}
              onChange={handleChapterChange}
              filterOption={(input, option) =>
                (option.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={
                selectedSubject
                  ? activeTabIndex === 1
                    ? myChapters.map((chapter) => ({
                        value: chapter,
                        label: chapter,
                      }))
                    : chapters.map((chapter) => ({
                        value: chapter,
                        label: chapter,
                      }))
                  : []
              }
            />
          </div>
        </div>
        <div className="w-1/2">
          <div className="mb-4">
            <label className="text-white-500 text-sm dark:text-white-400">
              Topic
            </label>
            <Select
              style={{ width: 200 }}
              showSearch
              value={selectedTopic}
              filterOption={(input, option) =>
                (option.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              onChange={handleTopicChange}
              options={
                selectedChapter
                  ? activeTabIndex === 1
                    ? myTopics.map((topic) => ({
                        value: topic,
                        label: topic,
                      }))
                    : topics.map((topic) => ({
                        value: topic,
                        label: topic,
                      }))
                  : []
              }
            />
          </div>
          
        </div>
        
      </div>
      <div className="flex space-x-4 mb-4">
      <div className="w-1/2">
      {isAdmin && (
        <div className="mb-4">
          <label className="text-white-500 text-sm dark:text-white-400">User</label>
         <Select
  style={{ width: 200 }}
  showSearch
  value={selectedUser}
  onChange={handleUserChange}
  filterOption={(input, option) => (option.label ?? "").toLowerCase().includes(input.toLowerCase())}
  options={users.map((user) => ({ value: user._id, label: user.name }))}
/>

        </div>
      )}
      </div>
      </div>
      <Tab.Group onChange={handleTabChange}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {isAdmin && (
            <Tab
              className={({ selected }) =>
                classNames(
                  "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                  "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                  selected
                    ? "bg-white text-blue-700 shadow"
                    : "text-blue-100 hover:bg-white/[0.12] hover:text-black"
                )
              }
            >
              All Questions
            </Tab>
          )}

          <Tab
            className={({ selected }) =>
              classNames(
                "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                selected
                  ? "bg-white text-blue-700 shadow"
                  : "text-blue-100 hover:bg-white/[0.12] hover:text-black"
              )
            }
          >
            My Questions
          </Tab>
        </Tab.List>

        <Tab.Panels className="mt-2 max-h-64 overflow-y-auto">
          <Tab.Panel
            className={classNames(
              "rounded-xl bg-white p-3",
              "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
            )}
          >
            {selectedSubject ? (
              activeTabIndex === 0 ? (
                <>
                  <h2 className="text-lg text-gray-900 font-medium mb-2">
                    All Questions ({filteredQuestions.length})
                  </h2>
                  <ul>
                    {isAdmin ? (
                      filteredQuestions.length > 0 ? (
                        filteredQuestions.map((question, index) => (
                          <li
                            key={`${question._id}-${index}`}
                            className="relative rounded-md p-3 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleQuestionClick(question)}
                          >
                            <p className="text-sm font-medium text-gray-900 leading-5">
                              Q.{" "}
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: question.question,
                                }}
                              />
                            </p>
                          </li>
                        ))
                      ) : (
                        <li className="relative text-gray-900 rounded-md p-3">
                          No questions found.
                        </li>
                      )
                    ) : (
                      <li className="relative text-gray-900 rounded-md p-3">
                        Admin access required to view all questions.
                      </li>
                    )}
                  </ul>
                </>
              ) : (
                <>
                  <h2 className="text-lg text-gray-900 font-medium mb-2">
                    My Questions ({filteredMyQuestions.length})
                  </h2>
                  <ul>
                    {filteredMyQuestions.length > 0 ? (
                      filteredMyQuestions.map((question, index) => (
                        <li
                          key={`${question._id}-${index}`}
                          className="relative rounded-md p-3 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleQuestionClick(question)}
                        >
                          <p className="text-sm font-medium text-gray-900 leading-5">
                            Q.{" "}
                            <span
                              dangerouslySetInnerHTML={{
                                __html: question.question,
                              }}
                            />
                          </p>
                        </li>
                      ))
                    ) : (
                      <li className="relative text-gray-900 rounded-md p-3">
                        No questions available for the selected subject.
                      </li>
                    )}
                  </ul>
                </>
              )
            ) : (
              <p className="text-gray-900">
                Please select a subject to view questions.
              </p>
            )}
          </Tab.Panel>

          <Tab.Panel
            className={classNames(
              "rounded-xl bg-white p-3",
              "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
            )}
          >
            {selectedSubject ? (
              activeTabIndex === 0 ? (
                <>
                  <h2 className="text-lg text-gray-900 font-medium mb-2">
                    All Questions ({filteredQuestions.length})
                  </h2>
                  <ul>
                    {isAdmin ? (
                      filteredQuestions.length > 0 ? (
                        filteredQuestions.map((question, index) => (
                          <li
                            key={`${question._id}-${index}`}
                            className="relative rounded-md p-3 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleQuestionClick(question)}
                          >
                            <p className="text-sm font-medium text-gray-900 leading-5">
                              Q.{" "}
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: question.question,
                                }}
                              />
                            </p>
                          </li>
                        ))
                      ) : (
                        <li className="relative text-gray-900 rounded-md p-3">
                          No questions found.
                        </li>
                      )
                    ) : (
                      <li className="relative text-gray-900 rounded-md p-3">
                        Admin access required to view all questions.
                      </li>
                    )}
                  </ul>
                </>
              ) : (
                <>
                  <h2 className="text-lg text-gray-900 font-medium mb-2">
                    My Questions ({filteredMyQuestions.length})
                  </h2>
                 
                  <ul>
                    {filteredMyQuestions.length > 0 ? (
                      filteredMyQuestions.map((question, index) => (
                        <li
                          key={`${question._id}-${index}`}
                          className="relative rounded-md p-3 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleQuestionClick(question)}
                        >
                          <p className="text-sm font-medium text-gray-900 leading-5">
                            Q.{" "}
                            <span
                              dangerouslySetInnerHTML={{
                                __html: question.question,
                              }}
                            />
                          </p>
                        </li>
                      ))
                    ) : (
                      <li className="relative text-gray-900 rounded-md p-3">
                        No questions available for the selected subject.
                      </li>
                    )}
                  </ul>
                </>
              )
            ) : (
              <p className="text-gray-900">
                Please select a subject to view questions.
              </p>
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

ProfileHead.propTypes = {
  setSelectedQuestion: PropTypes.func.isRequired,
};

export default ProfileHead;

