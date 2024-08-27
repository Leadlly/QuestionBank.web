import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Tab } from "@headlessui/react";
import axios from "axios";
import classNames from "classnames";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { Checkbox, Select } from "antd";
import { standards } from "../components/Options";
import { server } from "../main";
import "../styles/login.scss";
import { getSubjects } from "../actions/subjectAction";
import { getChapters } from "../actions/chapterAction";
import { getTopics } from "../actions/topicAction";
import Loading from "../pages/Loading";
import ViewChapTop from "./ViewChapTop";
import { getSubtopics } from "../actions/subtopicAction";
import _ from 'lodash';

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

const ProfileHead = ({ selectedQuestion, setSelectedQuestion, toBottom }) => {
  const [questions, setQuestions] = useState([]);
  const [userTodayQuestions, setUserTodayQuestions] = useState("");
  const [userRank, setUserRank] = useState("");
  const [topperUser, setTopperUser] = useState("");
  const [myQuestions, setMyQuestions] = useState([]);
  const [myRank, setMyRank] = useState("");
  const [myTodayQuestions, setTodayMyQuestions] = useState("");
  const [selectedStandard, setSelectedStandard] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState([]);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [myCurrentPage, setMyCurrentPage] = useState(1);
  const [myTotalPages, setMyTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questionsLength, setQuestionsLength] = useState(0);
  const [fixedTotalQuestions, setFixedTotalQuestions] = useState(0);
  const [fixedMyTotalQuestions, setFixedTotalMyQuestions] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchMyQuery, setSearchMyQuery] = useState("");
  const questionsPerPage = 50;
  const [inputValue, setInputValue] = useState('');
  const [selectedSubtopics, setSelectedSubtopics] = useState([]);
  const [isSubtopicsLoading, setIsSubtopicsLoading] = useState(false);
  const [myInputValue, setMyInputValue] = useState('');
  const inputRef = useRef(null);
  const myInputRef = useRef(null);
  const dispatch = useDispatch();
  const { subjectList } = useSelector((state) => state.getSubject);
  const { chapterList } = useSelector((state) => state.getChapter);
  const { topicList } = useSelector((state) => state.getTopic);
  const { subtopics } = useSelector((state) => state.getSubtopic);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState({});
  // State to track the currently expanded question
  const [viewedQuestionId, setViewedQuestionId] = useState(null);


  useEffect(() => {
    if (selectedStandard) {
      dispatch(getSubjects(selectedStandard));
    }
  }, [dispatch, selectedStandard]);

  useEffect(() => {
    if (selectedSubject && selectedStandard) {
      dispatch(getChapters(selectedSubject, selectedStandard));
    }
  }, [dispatch, selectedSubject, selectedStandard]);

  useEffect(() => {
    const fetchTopics = async () => {
      if (selectedSubject && selectedStandard && selectedChapter.length > 0) {
        try {
          const chapterNames = selectedChapter.join(','); // Convert array to comma-separated string
          const response = await dispatch(getTopics(selectedSubject, selectedStandard, chapterNames));

          if (response && response.payload) {
            setTopicList(response.payload);
          }
        } catch (error) {
          console.error('Error fetching topics:', error);
        }
      }
    };

    fetchTopics();
  }, [dispatch, selectedSubject, selectedStandard, selectedChapter]);

  useEffect(() => {
    const fetchSubtopics = async () => {
      if (
        selectedSubject &&
        selectedStandard &&
        selectedChapter.length > 0 &&
        selectedTopic.length > 0
      ) {
        setIsSubtopicsLoading(true);
        try {
          // Fetch subtopics based on selected criteria
          const response = await dispatch(
            getSubtopics(
              selectedSubject,
              selectedStandard,
              selectedChapter.join(","), // Convert chapter array to comma-separated string
              selectedTopic.join(",") // Convert topic array to comma-separated string
            )
          );
  
          if (response && response.payload) {
            setSelectedSubtopics(response.payload); // Update state with fetched subtopics
          } else {
            setSelectedSubtopics([]); // Reset subtopics if no data is received
          }
        } catch (error) {
          console.error("Error fetching subtopics:", error);
          setSelectedSubtopics([]); // Reset subtopics on error
        } finally {
          setIsSubtopicsLoading(false);
        }
      } else {
        setSelectedSubtopics([]); // Reset subtopics if required fields are not selected
      }
    };
  
    fetchSubtopics();
  }, [dispatch, selectedSubject, selectedStandard, selectedChapter, selectedTopic]);
  
  const { user } = useSelector((state) => state.user);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (activeTabIndex === 0) {
      fetchQuestions(
        selectedStandard,
        selectedSubject,
        selectedChapter,
        selectedTopic,
        selectedSubtopics,
        selectedUser,
        searchKeyword,
      );
    } else if (activeTabIndex === 1) {
      fetchUserQuestions(
        selectedStandard,
        selectedSubject,
        selectedChapter,
        selectedTopic,
        selectedSubtopics,
        searchMyQuery
      );
    }
  }, [
    selectedStandard,
    selectedSubject,
    selectedChapter,
    selectedTopic,
    selectedSubtopics,
    activeTabIndex,
    selectedUser,
    searchKeyword,
    searchMyQuery
  ]);

  const fetchQuestions = async (
    standard,
    subject,
    chapter,
    topic,
    subtopic,
    createdBy,
    limit, 
    page 
  ) => {
    setLoading(true);
    try {
      const response = await axios.get(`${server}/api/get/question`, {
        params: {
          standard,
          subject,
          chapter,
          topic,
          subtopic,
          createdBy,
          limit,
          page,
          search: searchKeyword, 
        },
        withCredentials: true,
      });
  
      if (response.data.success) {
        const questions = response.data.questions;
        setQuestions(questions.reverse()); 
        setUserTodayQuestions(response.data?.todaysQuestionsCount);
        setUserRank(response.data?.userRank);
        setTopperUser(response.data?.topperUser);
        const totalQuestions = response.data.totalQuestions || 0;
        setTotalQuestions(totalQuestions);
        setTotalPages(Math.ceil(totalQuestions / limit)); 
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to fetch questions. Please try again."); 
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTotalQuestionsDebounced = useCallback(
    _.debounce(async (
      standard,
      subject,
      chapter,
      topic,
      subtopic,
      createdBy,
      search,
      mySearch
    ) => {
      try {
        const response = await axios.get(`${server}/api/get/totalquestion`, {
          params: {
            standard,
            subject,
            chapter,
            topic,
            subtopic, 
            createdBy,
            search,
            mySearch,
          },
          withCredentials: true,
        });
  
        if (response.data.success) {
          const fixedMyTotalQuestions = response.data.totalMyQuestions || 0;
          setFixedTotalMyQuestions(fixedMyTotalQuestions);
          const fixedTotalQuestions = response.data.fixedTotalQuestions || 0;
          setFixedTotalQuestions(fixedTotalQuestions);
          setTotalQuestions(response.data.totalQuestions);
          setQuestionsLength(response.data.questionsLength);
          setTotalPages(
            Math.ceil(response.data.totalQuestions / questionsPerPage)
          );
  
          setMyTotalPages(
            Math.ceil(response.data.questionsLength / questionsPerPage)
          );
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch total questions count");
      }
    }, 500),
    []
  );
  

  const fetchUserQuestions = async (standard, subject, chapter, topicList, subtopic, limit, page) => {
    setLoading(true);
    try {
      const response = await axios.get(`${server}/api/get/myquestion`, {
        params: {
          standard,
          subject,
          chapter,
          topicList,
          subtopic,
          limit: questionsPerPage,
          page,
          search: searchMyQuery,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        const { questions, todaysQuestionsCount, userRank } = response.data;
        setMyQuestions(questions.reverse());
        setTodayMyQuestions(todaysQuestionsCount);
        setMyRank(userRank);
        const questionsLength = response.data.questionsLength || 0
        setQuestionsLength(questionsLength);
        setMyTotalPages(Math.ceil(questionsLength / limit));
      } else {
        setMyQuestions([]);
      }
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
    fetchUsers(
      selectedStandard,
      selectedSubject,
      selectedChapter,
      selectedTopic,
      searchKeyword
    );
  }, [
    isAdmin,
    selectedStandard,
    selectedSubject,
    selectedChapter,
    selectedTopic,
    searchKeyword
  ]);

  const handleResetFilters = () => {
    setSelectedSubject("");
    setSelectedChapter("");
    setSelectedTopic("");
    setSelectedStandard("")

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
    setSearchKeyword("");
    setSearchMyQuery("");
    setInputValue("");
    setMyInputValue("")
    setCurrentPage(1);
    setMyCurrentPage(1)
  };

  const handleTabChange = (index) => {
    setSelectedStandard("")
    setSelectedQuestion(null);
    setActiveTabIndex(index);
    setCurrentPage(1);
    setMyCurrentPage(1);
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
    setSelectedUser(null);
    setMyQuestions([]);
    setMyRank("");
    setUserRank("");
    setUserTodayQuestions("");
    setTodayMyQuestions("");
    setSearchMyQuery("");
    setSearchKeyword("");
    setInputValue("");
    setMyInputValue("")
  };
  useEffect(() => {
    if (!isAdmin) {
      setActiveTabIndex(1);
    }
  }, [isAdmin]);

  useEffect(() => {
    setSelectedSubject("");
    setSelectedChapter([]);
    setSelectedTopic([]);
    setSelectedSubtopics([])
    setSelectedUser("");
    setSubjects([]);
    setChapters([]);
    setTopics([]);
    setMySubjects([]);
    setMyChapters([]);
    setMyTopics([]);
    setQuestions([]);
    setMyQuestions([]);
    setMyTotalPages("");
    setTotalPages("");
    setSearchMyQuery('')
    setSearchKeyword('')
    setCurrentPage(1);
    setMyCurrentPage(1)
  }, [user]);

  const filteredQuestions = questions.filter(
    (question) =>
      (!selectedSubject || question.subject === selectedSubject) &&
      (!selectedUser || question.createdBy === selectedUser)
  );

  const filteredMyQuestions = myQuestions.filter((question) => {
    if (!selectedSubject) return true;
    return question.subject === selectedSubject;
  });

  const handleUserChange = (value) => {
    setSelectedUser(value);
    setUserRank("");
    setUserTodayQuestions("");

  };
  useEffect(() => {
    fetchTotalQuestionsDebounced(
      selectedStandard,
      selectedSubject,
      selectedChapter,
      selectedTopic,
      selectedSubtopics,
      selectedUser,
      searchKeyword,
      searchMyQuery
    );
  });
  
  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    toBottom();
  };

  const handleNextPage = () => {
    if (activeTabIndex === 0) {
      if (currentPage < totalPages) {
        const newPage = Math.min(currentPage + 1, totalPages);
        setCurrentPage(newPage);
        fetchQuestions(
          selectedStandard,
          selectedSubject,
          selectedChapter,
          selectedTopic,
          selectedSubtopics,
          selectedUser,
          questionsPerPage,
          newPage
        );
      }
    } else {
      if (myCurrentPage < myTotalPages) {
        const newPage = Math.min(myCurrentPage + 1, myTotalPages);
        setMyCurrentPage(newPage);
        fetchUserQuestions(
          selectedStandard,
          selectedSubject,
          selectedChapter,
          selectedTopic,
          selectedSubtopics,
          questionsPerPage,
          newPage
        );
      }
    }
  };

  const handlePrevPage = () => {
    if (activeTabIndex === 0) {
      if (currentPage > 1) {
        const newPage = Math.max(currentPage - 1, 1);
        setCurrentPage(newPage);
        fetchQuestions(
          selectedStandard,
          selectedSubject,
          selectedChapter,
          selectedTopic,
          selectedSubtopics,
          selectedUser,
          questionsPerPage,
          newPage
        );
      }
    } else {
      if (myCurrentPage > 1) {
        const newPage = Math.max(myCurrentPage - 1, 1);
        setMyCurrentPage(newPage);
        fetchUserQuestions(
          selectedStandard,
          selectedSubject,
          selectedChapter,
          selectedTopic,
          selectedSubtopics,
          questionsPerPage,
          newPage
        );
      }
    }
  };

  const handleSearch = useCallback(
    debounce((keyword) => {
      setCurrentPage(1);
      setSearchKeyword(keyword);
      if (inputRef.current) {
        inputRef.current.focus();
      }
      fetchQuestions(keyword);
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    setCurrentPage(1);
    const value = e.target.value;
    setInputValue(value);

    if (value === '') {
      resetSearchResults();
    } else if (value.endsWith(' ') || value.endsWith('\n')) {
      const trimmedValue = value.trim();
      handleSearch(trimmedValue);
    }
  };
  const handleSearchClick = () => {
    handleSearch(inputValue.trim());
  };
  const resetSearchResults = () => {
    setSearchKeyword('');
    setInputValue('');
  };


  const handleMySearch = useCallback(
    debounce((keyword) => {
      setMyCurrentPage(1);
      setSearchMyQuery(keyword);
      if (myInputRef.current) {
        myInputRef.current.focus();
      }
      fetchUserQuestions(keyword);
    }, 300),
    []
  );
  const handleMySearcChange = (e) => {
    setMyCurrentPage(1);
    const value = e.target.value;
    setMyInputValue(value);
    // setSearchMyQuery(e.target.value)
    if (value === '') {

      resetMySearchResults();
    } else if (value.endsWith(' ') || value.endsWith('\n')) {
      const trimmedValue = value.trim();
      handleMySearch(trimmedValue);
    }
  }
  const resetMySearchResults = () => {
    setSearchMyQuery('');
    setMyInputValue('');
  };
  const handleMySearchClick = () => {
    fetchUserQuestions(handleMySearch)
  }

  const renderSubtopicSelectors = (subtopics, level) => {
    if (!subtopics || subtopics.length === 0) {
      return null; // Return early if there are no subtopics
    }
  
    return (
      
     <div className="w-1/2">
  <div className="mb-4">
    <label className="text-white-500 text-sm dark:text-white-400">Subtopic</label>

    {/* Topic Selection */}
    {subtopics.length > 0 && (
            <Select
              mode="multiple"
              style={{ width: 200 }}
              value={selectedSubtopics}
              placeholder="Select Subtopics"
              onChange={(value) => setSelectedSubtopics(value)}
              loading={isSubtopicsLoading}
              options={subtopics.map((subtopic) => ({
                label: subtopic.name, // Adjust this based on the actual API response field
                value: subtopic.name, // Adjust this based on the actual API response field
              }))}
            />
          )}

          {/* Render recursive subtopics if they exist */}
          {subtopics.map((subtopic) => (
            <div key={`${subtopic._id}-${level}`} className="mt-3 ml-6">
              {/* Recursive call to render further levels of subtopics */}
              {renderSubtopicSelectors(subtopic.subtopics, level + 1)}
            </div>
          ))}
  </div>
      </div>
    );
  };
  
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedQuestions({}); // deselect all
    } else {
      const selectedQuestions = {};
      questions.forEach((question) => {
        selectedQuestions[question._id] = true;
      });
      setSelectedQuestions(selectedQuestions); 
    }
    setSelectAll(!selectAll);
  };

  const handleSelectQuestion = (questionId) => {
    const newSelectedQuestions = { ...selectedQuestions };
    if (newSelectedQuestions[questionId]) {
      delete newSelectedQuestions[questionId];
    } else {
      newSelectedQuestions[questionId] = true;
    }
    setSelectedQuestions(newSelectedQuestions);
  };



  return (
    <>
      <ViewChapTop />
      <div className="w-full max-w-md px-2 py-4 sm:px-2">
        <div className="flex space-x-4 mb-4">
          <div className="w-1/2">
            {activeTabIndex === 0 ? (
              <h3 className=" border-blue-600 border-2 p-2 bg-blue-900 rounded-lg">
                Over All Total Questions: {fixedTotalQuestions}
              </h3>
            ) : (
              <h3 className=" border-blue-600 border-2 p-2 bg-blue-900 rounded-lg">
                Over All Total Questions of User: {fixedMyTotalQuestions}
              </h3>
            )}
          </div>
          <div className="w-1/2">
            {questions && (
              <button className=" border-yellow-600 border-2 p-2 bg-yellow-900 rounded-lg">
                Todays Topper is{" "}
                <strong className=" text-red-600 bg-red-200 ">
                  {topperUser?.name?.name?.toUpperCase()}
                </strong>{" "}
                with <strong>{topperUser?.QuestionsCount} questions</strong>
              </button>
            )}
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
                  setSelectedChapter([]);
                  setSelectedTopic([]);
                  setSelectedSubtopics([])
                  setSelectedQuestion(null);
                  setCurrentPage(1)
                  setMyCurrentPage(1)
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
                  setSelectedChapter([]);
                  setSelectedTopic([]);
                  setSelectedSubtopics([])
                  setSelectedQuestion(null);
                  setCurrentPage(1)
                  setMyCurrentPage(1)
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
        <div className="relative z-0 w-full md:w-auto flex flex-col-reverse group">
          <Select
            mode="multiple"
            showSearch
            style={{ width: 200 }}
            filterOption={(input, option) =>
              (option.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            onChange={(value) => {
              setSelectedChapter(value);
              setSelectedTopic([]);
              setSelectedSubtopics([]);
            }}
            options={chapterList?.map((chapter) => ({
              value: chapter.name,
              label: chapter.name,
            }))}
            value={selectedChapter}
          />
          <label className="text-white-500 text-sm dark:text-white-400 mt-1">
            Chapter
          </label>
        </div>
      </div>

      <div className="w-1/2">
        <div className="mb-4">
          <label className="text-white-500 text-sm dark:text-white-400">
            Topic
          </label>
          
          <Select
            mode="multiple"
            style={{ width: 200 }}
            showSearch
            value={selectedTopic}
            filterOption={(input, option) =>
              (option.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            onChange={(value) => {
              setSelectedTopic(value);
              setSelectedSubtopics([]);
            }}
            options={topicList?.map((el) => ({
              value: el.name,
              label: el.name,
            }))}
          />
        </div>
        {isSubtopicsLoading && (
            <div className="loader relative top-0 right-0">
              <Loading />
            </div>
          )}
      </div>
       </div>
      <div className="flex space-x-4 mb-4">
      {selectedTopic.length > 0 && !isSubtopicsLoading && (
        renderSubtopicSelectors(subtopics, 0)
      )}
      </div>
        {subjectList && chapterList && topicList ? (
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
              {selectedUser && (
                <button className=" border-red-600 border-2 p-2 bg-red-900 rounded-lg m-5">
                  Todays Total Questions: {userTodayQuestions || 0}
                </button>
              )}
              {selectedUser && userRank && (
                <button className=" border-yellow-600 border-2 p-2 bg-yellow-900 rounded-lg">
                  Todays Rank: {userRank}
                </button>
              )}
              <div className="max-w-md mx-auto mb-2">
                {activeTabIndex === 0 && (
                  <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-md">
                    <input
                      ref={inputRef}
                      type="text"
                      className="w-full py-2 px-4 bg-gray-100 text-gray-900 focus:outline-none"
                      placeholder="Search questions..."
                      onChange={handleSearchChange}
                      value={inputValue}
                    />
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-4"
                      onClick={handleSearchClick}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 10 H 90 V 90 H 10 L 10 10"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 10 H 90 V 90 H 10 L 10 10"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                {activeTabIndex === 1 && (
                  <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-md">
                    <input
                      type="text"
                      className="w-full py-2 px-4 bg-gray-100 text-gray-900 focus:outline-none"
                      placeholder="Search my questions..."
                      onChange={handleMySearcChange}
                      value={myInputValue}
                    />
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
                      onClick={handleMySearchClick}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 10 H 90 V 90 H 10 L 10 10"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 10 H 90 V 90 H 10 L 10 10"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {isAdmin && (
  <Tab.Panel key="all-questions" className="rounded-xl bg-white p-3">
    <div className="max-h-64 overflow-y-auto">
      {loading ? (
        <Loading />
      ) : (
        <>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Total Questions: {totalQuestions}
          </h3>

          {/* Only show the question list if there are questions */}
          {totalQuestions > 0 && filteredQuestions.length > 0 ? (
            <>
                {(selectedTopic && selectedSubtopics.length === 0) || (selectedTopic && selectedSubtopics.length > 0) ? (
               <div>
                  <Checkbox checked={selectAll} onChange={handleSelectAll}>
                    Select All
                  </Checkbox>
                </div>
              ) : null}

              {/* Display the questions with checkboxes only if a topic is selected */}
              {selectedTopic ? (
                filteredQuestions.map((question, index) => (
                  <div
                    key={question._id}
                    onClick={() => handleQuestionClick(question)}
                    className="cursor-pointer text-gray-900 p-2 flex items-start space-x-4"
                  >
                    {selectedTopic && selectedSubtopics.length > 0 && (
                    <Checkbox
                      checked={!!selectedQuestions[question._id]} 
                      onChange={() => handleSelectQuestion(question._id)}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                    )}
                    <div>
                      <b>
                        Q. {(currentPage - 1) * questionsPerPage + index + 1}
                      </b>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: question.question,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">
                  Please select a topic to view questions.
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500">
              No questions available.
            </div>
          )}
        </>
      )}
    </div>
    <div className="flex justify-between mt-4">
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-2 rounded"
        onClick={handlePrevPage}
        disabled={currentPage === 0}
      >
        Prev
      </button>
      <p>
        <span className="text-gray-900">
          {totalQuestions === 0 ? "0 / " : `${currentPage} / `}
        </span>
        <span className="text-gray-900">
          {totalQuestions === 0 ? "0" : totalPages}
        </span>
      </p>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-2 rounded"
        onClick={handleNextPage}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        Next
      </button>
    </div>
  </Tab.Panel>
)}






              {activeTabIndex === 1 ? (
                <div>
                  <button className="border-red-600 border-2 p-2 bg-red-900 rounded-lg m-5">
                    Todays Total Questions: {myTodayQuestions}
                  </button>
                  <button className="border-yellow-600 border-2 p-2 bg-yellow-900 rounded-lg">
                    Todays Rank: {myRank || 0}
                  </button>
                </div>
              ) : null}

              <Tab.Panel key="my-questions" className="rounded-xl bg-white p-3">
                <div className="max-h-64 overflow-y-auto">
                  {loading ? (
                    <Loading />
                  ) : (
                    <>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Total Questions: {questionsLength}
                      </h3>

                      {questionsLength === 0 ? (
                        <div className="text-center text-gray-500">
                          No questions found.
                        </div>
                      ) : (
                        filteredMyQuestions.map((question, index) => (
                          <div
                            key={question._id}
                            onClick={() => handleQuestionClick(question)}
                            className="cursor-pointer text-gray-900 p-2"
                          >
                            <b>
                              Q.{" "}
                              {(myCurrentPage - 1) * questionsPerPage + index + 1}
                            </b>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: question.question,
                              }}
                            />
                          </div>
                        ))
                      )}
                    </>
                  )}
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-2 rounded"
                    onClick={handlePrevPage}
                    disabled={myCurrentPage === 1}
                  >
                    Prev
                  </button>
                  <p>
                    <span className="text-gray-900">
                      {questionsLength === 0 ? "0 / " : `${myCurrentPage} / `}
                    </span>
                    <span className="text-gray-900">
                      {questionsLength === 0 ? "0" : myTotalPages}
                    </span>
                  </p>

                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-2 rounded"
                    onClick={handleNextPage}
                    disabled={
                      myCurrentPage === myTotalPages || myTotalPages === 0
                    }
                  >
                    Next
                  </button>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </>
  );
};

ProfileHead.propTypes = {
  setSelectedQuestion: PropTypes.func.isRequired,
  toBottom: PropTypes.func.isRequired,
  selectedQuestion: PropTypes.func.isRequired
};

export default ProfileHead;
