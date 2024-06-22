import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Tab } from "@headlessui/react";
import axios from "axios";
import classNames from "classnames";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { Select } from "antd";
import { standards } from "../components/Options";
import { server } from "../main";
import "../styles/login.scss";
import { getSubjects } from "../actions/subjectAction";
import { getChapters } from "../actions/chapterAction";
import { getTopics } from "../actions/topicAction";
import Loading from "../pages/Loading";

const ProfileHead = ({ setSelectedQuestion, toBottom }) => {
  const [questions, setQuestions] = useState([]);
  const [userTodayQuestions, setUserTodayQuestions] = useState("");
  const [userRank, setUserRank] = useState("");
  const [topperUser, setTopperUser] = useState("");
  const [myQuestions, setMyQuestions] = useState([]);
  const [myRank, setMyRank] = useState("");
  const [myTodayQuestions, setTodayMyQuestions] = useState("");
  const [selectedStandard, setSelectedStandard] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [subjects, setSubjects] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [mySubjects, setMySubjects] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [chapters, setChapters] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [myChapters, setMyChapters] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [topics, setTopics] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [myTopics, setMyTopics] = useState([]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPageAllQuestions, setCurrentPageAllQuestions] = useState(1);
  const [currentPageMyQuestions, setCurrentPageMyQuestions] = useState(1);
  
  const questionsPerPage = 50;

  const dispatch = useDispatch();

  const { subjectList } = useSelector((state) => state.getSubject);
  const { chapterList } = useSelector((state) => state.getChapter);
  const { topicList } = useSelector((state) => state.getTopic);

  useEffect(() => {
    if (selectedStandard) {
      dispatch(getSubjects(selectedStandard));
    }
    if (selectedSubject && selectedStandard) {
      dispatch(getChapters(selectedSubject, selectedStandard));
    }
    if (selectedSubject && selectedStandard && selectedChapter) {
      dispatch(getTopics(selectedSubject, selectedStandard, selectedChapter));
    }
  }, [dispatch, selectedStandard, selectedSubject, selectedChapter]);

  const { user } = useSelector((state) => state.user);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
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
    setLoading(true);
    try {
      const response = await axios.get(`${server}/api/get/question`, {
        params: { standard, subject, chapter, topic, createdBy },
        withCredentials: true,
      });

      if (response.data.success) {
        const questions = response.data.questions;
        setQuestions(questions);
        setUserTodayQuestions(response.data?.todaysQuestionsCount);
        setUserRank(response.data?.userRank);
        setTopperUser(response.data?.topperUser);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserQuestions = async (standard, subject, chapter, topic) => {
    setLoading(true);
    try {
      const response = await axios.get(`${server}/api/get/myquestion`, {
        params: { standard, subject, chapter, topic },
        withCredentials: true,
      });

      const questions = response.data.questions;
      setMyQuestions(questions);
      setTodayMyQuestions(response.data?.todaysQuestionsCount);
      setMyRank(response.data?.userRank);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      if (isAdmin) {
        const response = await axios.get(`${server}/api/get/users`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setUsers(response.data.users);
        } else {
          toast.error("Failed to fetch users.");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isAdmin]);

  const handleResetFilters = () => {
    setSelectedSubject("");
    setSelectedChapter("");
    setSelectedTopic("");

    setSubjects([]);
    setChapters([]);
    setTopics([]);
    setMySubjects([]);
    setMyChapters([]);
    setMyTopics([]);
    setSelectedUser(null);
    setSelectedStandard("");
    setMyRank("");
    setUserRank("");
    setUserTodayQuestions("");
    setTodayMyQuestions("");
  };

  const handleTabChange = (index) => {
    setSelectedQuestion(null);
    setActiveTabIndex(index);

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
    setSelectedUser(null)
    setMyQuestions([]);
    setMyRank('')
    setUserRank('')
    setUserTodayQuestions('')
    setTodayMyQuestions('')

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
      (!selectedUser || question.createdBy === selectedUser) &&
      question.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMyQuestions = myQuestions.filter(
    (question) =>
      (!selectedSubject || question.subject === selectedSubject) &&
      question.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

    const handleSearchChange = (e) => {
      setSearchQuery(e.target.value);
    };
  
   
  const handleUserChange = (value) => {
    setSelectedUser(value);
    setUserRank("");
    setUserTodayQuestions("");
    fetchQuestions(
      selectedStandard,
      selectedSubject,
      selectedChapter,
      selectedTopic,
      value
    );
  };

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    toBottom();
  };

  const handleNextPage = () => {
    if (activeTabIndex === 0) {
      setCurrentPageAllQuestions((prev) => prev + 1);
    } else if (activeTabIndex === 1) {
      setCurrentPageMyQuestions((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (activeTabIndex === 0) {
      setCurrentPageAllQuestions((prev) => prev - 1);
    } else if (activeTabIndex === 1) {
      setCurrentPageMyQuestions((prev) => prev - 1);
    }
  };

  const paginate = (array, pageSize, pageNumber) =>
    array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

  const totalQuestionsPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const totalMyQuestionsPages = Math.ceil(filteredMyQuestions.length / questionsPerPage);


  return (
    <>
      {questions && (
        <button className=" border-yellow-600 border-2 p-2 bg-yellow-900 rounded-lg">
          Todays Topper is{" "}
          <strong className=" text-red-600 bg-red-200 p-2 rounded-md">
            {topperUser?.name?.name?.toUpperCase()}
          </strong>{" "}
          with <strong>{topperUser?.QuestionsCount} questions</strong>
        </button>
      )}

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
                  setSelectedQuestion(null);
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
                onChange={(value) => {
                  setSelectedSubject(value);
                  setSelectedChapter("");
                  setSelectedTopic("");
                  setSelectedQuestion(null);
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
                onChange={(value) => {
                  setSelectedChapter(value);
                  setSelectedTopic("");
                  setSelectedQuestion(null);
                }}
                filterOption={(input, option) =>
                  (option.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={chapterList?.map((chapter) => ({
                  value: chapter.name,
                  label: chapter.name,
                }))}
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
                  (option.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                onChange={(value) => setSelectedTopic(value)}
                options={topicList?.map((el) => ({
                  value: el.name,
                  label: el.name,
                }))}
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
          <div className="w-1/2 m-5">
            <button
              className=" border-green-600 border-2 p-2 bg-green-900 rounded-lg"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
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
          <div className="mt-2 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search questions..."
          className="w-full p-2 border text-gray-900 rounded-lg"
        />
      </div>
      <Tab.Panels className="mt-2">
  {selectedUser && (
    <button className="border-red-600 border-2 p-2 bg-red-900 rounded-lg m-5">
      Todays Total Questions: {userTodayQuestions || 0}
    </button>
  )}
  {selectedUser && userRank && (
    <button className="border-yellow-600 border-2 p-2 bg-yellow-900 rounded-lg">
      Todays Rank: {userRank}
    </button>
  )}
  {isAdmin && (
    <Tab.Panel key="All Questions" className="rounded-xl bg-white p-3 relative">
      <div className="overflow-y-auto max-h-64">
        {loading ? (
          <Loading />
        ) : (
          <>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Total Questions: {filteredQuestions.length}
            </h3>
            {filteredQuestions.length === 0 ? (
              <div className="text-center text-gray-500">
                No questions found.
              </div>
            ) : (
              <div className="overflow-y-auto">
               {paginate(filteredQuestions, questionsPerPage, currentPageAllQuestions).map((question, index) => (
                  <div
                    key={question._id}
                    onClick={() => handleQuestionClick(question)}
                    className="cursor-pointer text-gray-900 p-2"
                  >
                    <b>Q.{(currentPageAllQuestions - 1) * questionsPerPage + index + 1}. </b>
                    <span dangerouslySetInnerHTML={{ __html: question.question }} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex justify-between mt-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-2 rounded"
          onClick={handlePrevPage}
          disabled={currentPageAllQuestions === 1}
        >
          Prev
        </button>
        <div className="flex items-center text-gray-900">
          {totalQuestionsPages > 0 && (
            <span className="mr-4">
              Page {currentPageAllQuestions} of {totalQuestionsPages}
            </span>
          )}
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-2 rounded"
          onClick={handleNextPage}
          disabled={currentPageAllQuestions === totalQuestionsPages || totalQuestionsPages === 0}
        >
          Next
        </button>
      </div>
    </Tab.Panel>
  )}

  {activeTabIndex === 1 && (
    <div>
      <button className="border-red-600 border-2 p-2 bg-red-900 rounded-lg m-5">
        Todays Total Questions: {myTodayQuestions}
      </button>
      <button className="border-yellow-600 border-2 p-2 bg-yellow-900 rounded-lg">
        Todays Rank: {myRank || 0}
      </button>
    </div>
  )}

  <Tab.Panel key="My Questions" className="rounded-xl bg-white p-3">
    <div className="max-h-64 overflow-y-auto">
      {loading ? (
        <Loading />
      ) : (
        <>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Total Questions: {filteredMyQuestions.length}
          </h3>
          {filteredMyQuestions.length === 0 ? (
            <div className="text-center text-gray-500">
              No questions found.
            </div>
          ) : (
            <div className="mt-4">
              {paginate(filteredMyQuestions, questionsPerPage, currentPageMyQuestions).map((question, index) => (
                <div
                  key={question._id}
                  onClick={() => handleQuestionClick(question)}
                  className="cursor-pointer text-gray-900 p-2"
                >
                  <b>Q.{(currentPageMyQuestions - 1) * questionsPerPage + index + 1}. </b>
                  <span dangerouslySetInnerHTML={{ __html: question.question }} />
                </div>
              ))}
              <div className="flex justify-between mt-4">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-2 rounded"
                  onClick={handlePrevPage}
                  disabled={currentPageMyQuestions === 1}
                >
                  Prev
                </button>
                <div className="flex items-center text-gray-900">
                  {totalMyQuestionsPages > 0 && (
                    <span className="mr-4">
                      Page {currentPageMyQuestions} of {totalMyQuestionsPages}
                    </span>
                  )}
                </div>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                  onClick={handleNextPage}
                  disabled={currentPageMyQuestions === totalMyQuestionsPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  </Tab.Panel>
</Tab.Panels>

        </Tab.Group>
      </div>
    </>
  );
};

ProfileHead.propTypes = {
  setSelectedQuestion: PropTypes.func.isRequired,
  toBottom: PropTypes.func.isRequired,
};

export default ProfileHead;
