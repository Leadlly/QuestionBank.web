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
        fetchQuestions(
          selectedStandard,
          selectedSubject,
          selectedChapter,
          selectedTopic,
          selectedUser
        );
      } else if (activeTabIndex === 1) {
        fetchUserQuestions(
          selectedStandard,
          selectedSubject,
          selectedChapter,
          selectedTopic
        );
      }
    }
  }, [
    selectedStandard,
    selectedSubject,
    selectedChapter,
    selectedTopic,
    activeTabIndex,
    selectedUser,
  ]);

  const fetchQuestions = async (
    standard,
    subject,
    chapter,
    topic,
    createdBy
  ) => {
    try {
      const response = await axios.get(`${server}/api/get/question`, {
        params: { standard, subject, chapter, topic, createdBy },
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
        const response = await axios.get(`${server}/api/get/users`, {
          withCredentials: true,
        });
        console.log(response.data);
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
    setSelectedUser(null)
    setMyQuestions([]);

    if (selectedStandard) {
      if (index === 0) {
        fetchQuestions(
          selectedStandard,
          selectedSubject,
          selectedChapter,
          selectedTopic
        );
      } else if (index === 1) {
        fetchUserQuestions(
          selectedStandard,
          selectedSubject,
          selectedChapter,
          selectedTopic
        );
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
    setSelectedUser("")
    setSubjects([]);
    setChapters([]);
    setTopics([]);
    setMySubjects([]);
    setMyChapters([]);
    setMyTopics([]);
    setQuestions([]);
    setMyQuestions([]);
  }, [user]);

  const filteredQuestions = questions.filter(
    (question) =>
      (!selectedSubject || question.subject === selectedSubject) &&
      (!selectedUser || question.createdBy === selectedUser)
  );

  const filteredMyQuestions = selectedSubject
    ? myQuestions.filter((question) => question.subject === selectedSubject)
    : myQuestions;

  const handleUserChange = (value) => {
    setSelectedUser(value);
    fetchQuestions(
      selectedStandard,
      selectedSubject,
      selectedChapter,
      selectedTopic,
      value
    );
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
      fetchUserQuestions(
        selectedStandard,
        selectedSubject,
        selectedChapter,
        value
      );
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
          {isAdmin && activeTabIndex === 0 && (
            <div className="mb-4">
              <label className="text-white-500 text-sm dark:text-white-400">
                User
              </label>
              <Select
                style={{ width: 200 }}
                showSearch
                value={selectedUser}
                onChange={handleUserChange}
                filterOption={(input, option) =>
                  (option.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={users.map((user) => ({
                  value: user._id,
                  label: user.name,
                }))}
              />
            </div>
          )}
        </div>
      </div>
      <Tab.Group selectedIndex={activeTabIndex} onChange={handleTabChange}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {isAdmin && (
            <Tab
              key="all-questions"
              className={({ selected }) =>
                classNames(
                  "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700",
                  "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                  selected
                    ? "bg-white shadow"
                    : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
                )
              }
            >
              All Questions
            </Tab>
          )}
          <Tab
            key="my-questions"
            className={({ selected }) =>
              classNames(
                "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700",
                "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                selected
                  ? "bg-white shadow"
                  : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
              )
            }
          >
            My Questions
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-2">
          {isAdmin && (
            <Tab.Panel key="all-questions" className="rounded-xl bg-white p-3">
              <div className="max-h-64 overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Total Questions: {filteredQuestions.length}
                </h3>
                {filteredQuestions.length === 0 ? (
                  <div className="text-center text-gray-500">
                    No questions found.
                  </div>
                ) : (
                  filteredQuestions.map((question, index) => (
                    <div
                      key={question._id}
                      onClick={() => handleQuestionClick(question)}
                      className="cursor-pointer text-gray-900 p-2 "
                    >
                      <b>Q.{index + 1}.{" "}</b>
                      <span
                        dangerouslySetInnerHTML={{ __html: question.question }}
                      />
                    </div>
                  ))
                )}
              </div>
            </Tab.Panel>
          )}
          <Tab.Panel key="my-questions" className="rounded-xl bg-white p-3">
            <div className="max-h-64 overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Total Questions: {filteredMyQuestions.length}
              </h3>
              {filteredMyQuestions.length === 0 ? (
                <div className="text-center text-gray-500">
                  No questions found.
                </div>
              ) : (
                filteredMyQuestions.map((question, index) => (
                  <div
                    key={question._id}
                    onClick={() => handleQuestionClick(question)}
                    className="cursor-pointe text-gray-900 r p-2 cursor-pointer"
                  >
                    <b>Q.{index + 1}.{" "}</b>
                    <span
                      dangerouslySetInnerHTML={{ __html: question.question }}
                    />
                  </div>
                ))
              )}
            </div>
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
