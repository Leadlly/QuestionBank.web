import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Tab } from "@headlessui/react";
import axios from "axios";
import classNames from "classnames";
import toast from "react-hot-toast";
// import { useDispatch } from "react-redux";
import { Select } from "antd";
import { standards } from "../components/Options";
import { server } from "../main";
import "../styles/login.scss";
import { getSubjects } from "../actions/subjectAction";
import { getChapters } from "../actions/chapterAction";
import { getTopics } from "../actions/topicAction";
import Loading from "../pages/Loading";
import ViewChapTop from "./ViewChapTop";
import { animateScroll as scroll } from "react-scroll";
import EditModel from "../components/EditModel"
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { LuPencilLine } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteQuestion, editQuestion } from "../actions/questionAction";



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



const ProfileHead = () => {
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [myCurrentPage, setMyCurrentPage] = useState(1);
  const [myTotalPages, setMyTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalMyQuestions, setTotalMyQuestions] = useState(0);
  const [questionsLength, setQuestionsLength] = useState(0);
  const [fixedTotalQuestions, setFixedTotalQuestions] = useState(0);
  const [fixedMyTotalQuestions, setFixedTotalMyQuestions] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchMyQuery, setSearchMyQuery] = useState("");
  const questionsPerPage = 50;
  const [inputValue, setInputValue] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [myInputValue, setMyInputValue] = useState('');
  const inputRef = useRef(null);
  const myInputRef = useRef(null);
  const dispatch = useDispatch();
  const { subjectList } = useSelector((state) => state.getSubject);
  const { chapterList } = useSelector((state) => state.getChapter);
  const { topicList } = useSelector((state) => state.getTopic);
  const navigate = useNavigate();
  const [tagStatus, setTaggedStatus] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState("");
  const [editedOption, setEditedOption] = useState({ id: "", name: "", tag: "" });
  const [showSymbols, setShowSymbols] = useState(false);
  const [showOptionSymbols, setShowOptionSymbols] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.user);
  const { success: deleteSuccess, error: deleteError } = useSelector((state) => state.delete);
  const { success: editSuccess, error: editError } = useSelector((state) => state.editQuestion);
  const quillRef = useRef(null);
  const [isTagged, setIsTagged] = useState('');
  const [totalTagged, setTotalTagged] = useState(0);
  const [totalUntagged, setTotalUntagged] = useState(0);
  const [totalNew, setTotalNew] = useState(0);
const [myQuestionsLength, setMyQuestionsLength] = useState(0);
const [totalMyTagged, setTotalMyTagged] = useState(0);
const [totalMyUntagged, setTotalMyUntagged] = useState(0);



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
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (selectedStandard) {
      dispatch(getSubjects(selectedStandard));
    }
  
    if (selectedSubject && selectedStandard) {
      dispatch(getChapters(selectedSubject, selectedStandard));
    }
  
    const chapterId = selectedChapter?._id || selectedChapter; 
  
    if (selectedSubject && selectedStandard && chapterId) {
      console.log("Dispatching getTopics with chapterId:", chapterId);
      dispatch(getTopics(selectedSubject, selectedStandard, chapterId)); // Pass the chapter ID directly
    } else {
      console.log("Skipping getTopics dispatch, missing chapterId:", { selectedSubject, selectedStandard, chapterId });
    }
  }, [dispatch, selectedStandard, selectedSubject, selectedChapter]);
  
  
  const { user } = useSelector((state) => state.user);

  const isAdmin = user?.role === "admin";

 

  const fetchQuestions = async (
    standard,
    subject,
    chapterId,
    topicId,
    createdBy,
    limit,
    page,
    isTagged,
  ) => {
    setLoading(true);
    try {
      const response = await axios.get(`${server}/api/get/question`, {
        params: {
          standard,
          subject,
          chapterId,
          topicId,
          createdBy,
          limit,
          page,
          search: searchKeyword,
          isTagged,
        },
        withCredentials: true,
      });
  
      if (response.data.success) {
        const questions = response.data.questions || [];
        setQuestions(questions);
  
        setUserTodayQuestions(response.data?.todaysQuestionsCount);
        setUserRank(response.data?.userRank);
        setTopperUser(response.data?.topperUser);
  
        const totalQuestions = response.data.totalQuestions || 0;
        setTotalQuestions(totalQuestions);
  
        setTotalPages(Math.ceil(totalQuestions / limit));
  
        if (isTagged === 'tagged') {
          setTotalTagged(totalQuestions);
        } else if (isTagged === 'untagged') {
          setTotalUntagged(totalQuestions);
        } else if (isTagged === 'new') {
          setTotalNew(totalQuestions);
        }
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error(error);
  
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  
  
  const fetchTotalQuestions = async (
    standard,
    subject,
    chapterId,
    topicId,
    createdBy,
    search,
    mySearch,
    isTagged
  ) => {
    try {
      const response = await axios.get(`${server}/api/get/totalquestion`, {
        params: {
          standard,
          subject,
          chapterId,
          topicId,
          createdBy,
          search,
          mySearch,
          isTagged,
        },
        withCredentials: true,
      });
  
      if (response.data.success) {
        const totalMyQuestions = response.data.totalMyQuestions || 0;
        setTotalMyQuestions(totalMyQuestions);
  
        const totalQuestions = response.data.totalQuestions || 0;
        setTotalQuestions(totalQuestions);
  
        if (mySearch) {
          setTotalQuestions(totalMyQuestions); 
        }
  
        const totalTagged = response.data.totalTagged || 0;
        setTotalTagged(totalTagged);
  
        const totalUntagged = response.data.totalUntagged || 0;
        setTotalUntagged(totalUntagged);
  
        const totalMyTagged = response.data.totalMyTagged || 0;
        setTotalMyTagged(totalMyTagged);
  
        const totalMyUntagged = response.data.totalMyUntagged || 0;
        setTotalMyUntagged(totalMyUntagged);
  
        if (isTagged === 'tagged') {
          setQuestionsLength(totalTagged);
          setMyQuestionsLength(totalMyTagged);
        } else if (isTagged === 'untagged') {
          setQuestionsLength(totalUntagged);
          setMyQuestionsLength(totalMyUntagged);
        } else {
          setQuestionsLength(totalQuestions); 
          setMyQuestionsLength(totalMyQuestions); 
        }
  
        setTotalPages(Math.ceil(totalQuestions / questionsPerPage));
        setMyTotalPages(Math.ceil(totalMyQuestions / questionsPerPage));
      }
    } catch (error) {
    const errorMessage =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : "An unexpected error occurred";

    toast.error(errorMessage);
    }
  };
  
const fetchUserQuestions = async (
  standard,
  subject,
  chapterId,
  topicId,
  limit,
  page,
  isTagged
) => {
  setLoading(true);
  try {
    const validStandard = typeof standard === 'number' ? standard : undefined;

    const response = await axios.get(`${server}/api/get/myquestion`, {
      params: {
        standard: validStandard, 
        subject: subject || undefined,
        chapterId: chapterId || undefined,
        topicId: topicId || undefined,
        limit: limit || 50,
        page: page || 1,
        isTagged: isTagged,
        search: searchMyQuery || undefined,
      },
      withCredentials: true,
    });

    if (response.data.success) {
      const {
        questions,
        todaysQuestionsCount,
        userRank,
        totalMyTagged,
        totalMyUntagged,
      } = response.data;

      setMyQuestions(questions.reverse());
      setTodayMyQuestions(todaysQuestionsCount);
      setMyRank(userRank);

      const totalMyQuestions = response.data.totalMyQuestions || 0;
      setTotalMyQuestions(totalMyQuestions);

      if (isTagged === 'tagged') {
        setTotalMyTagged(totalMyTagged);
      } else if (isTagged === 'untagged') {
        setTotalMyUntagged(totalMyUntagged);
      }  else if (isTagged === 'new') {
        setTotalNew(totalQuestions);
      }

      setMyTotalPages(Math.ceil(totalMyQuestions / limit));
    } else {
      setMyQuestions([]);
      setTotalMyQuestions([])
      setTotalQuestions([])
    }
  } catch (error) {
    const errorMessage =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : "An unexpected error occurred";

    console.log(errorMessage);
  } finally {
    setLoading(false);
  }
};


  
  useEffect(() => {
    if (activeTabIndex === 0) {
      fetchQuestions(
        selectedStandard,
        selectedSubject,
        selectedChapter,
        selectedTopic,
        selectedUser,
        50,
        currentPage,
        isTagged,
      );
    } else if (activeTabIndex === 1) {
      fetchUserQuestions(
        selectedStandard,
        selectedSubject,
        selectedChapter,
        selectedTopic,
        50, // Pass limit if needed
        currentPage, // Ensure currentPage is passed
        isTagged,
      );
    }
  }, [
    selectedStandard,
    selectedSubject,
    selectedChapter,
    selectedTopic,
    activeTabIndex,
    selectedUser,
    searchKeyword,
    searchMyQuery,
    isTagged,
    currentPage,
  ]);
  
  

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
    setIsTagged("")
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
    setSelectedChapter("");
    setSelectedTopic("");
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
    fetchTotalQuestions(selectedStandard, selectedSubject, selectedChapter, selectedTopic, selectedUser, searchKeyword, searchMyQuery, isTagged);
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
          selectedUser,
          questionsPerPage,
          newPage,
          isTagged
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
          questionsPerPage,
          newPage,
          isTagged
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
          selectedUser,
          questionsPerPage,
          newPage,
          isTagged
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
          questionsPerPage,
          newPage,
          isTagged
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


  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleSaveEdits = (updatedQuestion) => {
    setSelectedQuestion(updatedQuestion);
    setIsModalOpen(false);
  };

  const closeModals = () => {
    setIsModalOpen(false);
  };
  const insertSymbol = (symbol) => {
    setEditedQuestion((prev) => `${prev}${symbol}`);
    setShowSymbols(false);
  };

  const insertOptionSymbol = (symbol) => {
    setEditedOption((prev) => ({
      ...prev,
      name: `${prev.name}${symbol}`
    }));
    setShowOptionSymbols(false);
  };

  const renderMathSymbols = (insertFunc) => (
    <div className="overflow-y-auto h-32 border bg-white text-gray-900 border-gray-300 rounded p-2">
      <ol className="space-y-0 flex flex-wrap gap-2">
        {mathSymbols.map((item) => (
          <li key={item.symbol}>
            <button onClick={() => insertFunc(item.symbol)} className="p-2 rounded border border-gray-400 hover:bg-gray-200">
              {item.symbol}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate, isAuthenticated]);

  useEffect(() => {
    if (editSuccess) {
      toast.success("Question updated successfully");
      setSelectedQuestion((prevQuestion) => ({
        ...prevQuestion,
        question: editedQuestion,
      }));
      setIsEditModalOpen(false);
    }
    if (editError) {
      toast.error(editError);
    }
  }, [editSuccess, editError, editedQuestion]);

  const handleDelete = async (id) => {
    if (window.confirm("Confirm before deletion")) {
      dispatch(deleteQuestion(id));

      setTimeout(() => {
        if (deleteSuccess) {
          toast.success("Question deleted successfully");
          if (selectedQuestion && selectedQuestion._id === id) {
            setSelectedQuestion(null);
          }
        } else if (deleteError) {
          toast.error(deleteError);
        }
      }, 500);
    }
  };

  const handleEditQuestion = (question) => {
    setEditedQuestion(question.question);
    setSelectedQuestion(question);
    setIsEditModalOpen(true);
  };

  const handleEditOption = (option) => {
    setEditedOption({
      id: option._id,
      name: option.name,
      tag: option.tag,
    });
    setIsEditModalOpen(true);
  };

  const updateOption = async () => {
    try {
      const response = await axios.put(
        `${server}/api/edit/question/${selectedQuestion._id}/option/${editedOption.id}`,
        {
          name: editedOption.name,
          tag: editedOption.tag,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        const updatedQuestion = response.data.question;
        toast.success(response.data.message);
        setSelectedQuestion(updatedQuestion);
      } else {
        toast.error(response.data.message || "Failed to update option");
      }
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating option:", error.message);
      toast.error("Failed to update option. Please try again.");
    }
  };

  const closeModal = () => {
    setIsEditModalOpen(false);
    setEditedQuestion("");
    setEditedOption({ id: "", name: "", tag: "" });
  };

  const handleModalClick = (e) => {
    if (e.target.id === "modalOverlay") {
      closeModal();
    }
  };

  const handleTextareaChange = (value) => {
    setEditedQuestion(value);
  };

  const handleOptionNameChange = (value) => {
    setEditedOption({
      ...editedOption,
      name: value,
    });
  };

  const handleOptionTagChange = (e) => {
    setEditedOption({
      ...editedOption,
      tag: e.target.value,
    });
  };

  const handleSaveChanges = () => {
    if (editedOption.id) {
      updateOption();
    } else {
      dispatch(editQuestion(selectedQuestion._id, editedQuestion));
      setIsEditModalOpen(false);
    }
  };

  const toBottom = () => {
    scroll.scrollToBottom({ delay: 0, duration: 0, behavior: 'smooth' });

  };
  const fetchTaggedStatus = async () => {
    if (selectedQuestion && selectedQuestion._id) {
      try {
        const response = await axios.get(`${server}/api/questions/${selectedQuestion._id}/status`);
        if (response.data.success) {
          setTaggedStatus(response.data.status);
        }
      } catch (error) {
        console.error('Error fetching tagged status:', error);
      }
    }
  };

  useEffect(() => {
    fetchTaggedStatus();
  }, [selectedQuestion]);
  const handleNextQuestion = () => {
    const currentIndex = filteredQuestions.findIndex(q => q._id === selectedQuestion._id);
    if (currentIndex < filteredQuestions.length - 1) {
      setSelectedQuestion(filteredQuestions[currentIndex + 1]);
    }
  };
  
  const handlePrevQuestion = () => {
    const currentIndex = filteredQuestions.findIndex(q => q._id === selectedQuestion._id);
    if (currentIndex > 0) {
      setSelectedQuestion(filteredQuestions[currentIndex - 1]);
    }
  };
  const handleMyPrevPage = () => {
    const currentMyIndex = filteredMyQuestions.findIndex(q => q._id === selectedQuestion?._id);
    if (currentMyIndex > 0) {
      setSelectedQuestion(filteredMyQuestions[currentMyIndex - 1]);
    }
  };

  const handleMyNextPage = () => {
    const currentMyIndex = filteredMyQuestions.findIndex(q => q._id === selectedQuestion?._id);
    if (currentMyIndex < filteredMyQuestions.length - 1) { 
      setSelectedQuestion(filteredMyQuestions[currentMyIndex + 1]);
    }
  };
  const getQuestionNumber = () => {
    if (activeTabIndex === 0) {
      return filteredQuestions.findIndex(q => q._id === selectedQuestion?._id) + 1 + ((currentPage - 1) * questionsPerPage);
    } else if (activeTabIndex === 1) {
      return filteredMyQuestions.findIndex(q => q._id === selectedQuestion?._id) + 1;
    }
    return 0;
  };
 
  return (
    <>
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-full max-w-md px-2 py-4 sm:px-2">
          <ViewChapTop />
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
          <div className="mt-4">
         
<select
  className="border-blue-600 border-2 p-2 bg-blue-900 text-white rounded-lg"
  value={isTagged}
  tabIndex={1} 
  onChange={(e) => {
    const value = e.target.value;
    setIsTagged(value);

    if (document.activeElement.tabIndex === 1) {
      if (value === "tagged") {
        fetchUserQuestions("tagged");
      } else if (value === "untagged") {
        fetchUserQuestions("untagged");
      } else if (value === "new") {
        fetchUserQuestions("new");
      } else {
        fetchQuestions("");
      }
    }
  }}
>
  <option value="">All Questions</option>
  <option value="tagged">Tagged</option>
  <option value="untagged">Untagged</option>
  <option value="new">New</option>
</select>



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
                    setSelectedChapter("");
                    setSelectedTopic("");
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
                    setSelectedChapter("");
                    setSelectedTopic("");
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
              <div className="mb-4">
                <label className="text-white-500 text-sm dark:text-white-400">
                  Chapter
                </label>
                <Select
  style={{ width: 200 }}
  showSearch
  value={selectedChapter}  // Ensure selectedChapter holds the chapter ID
  onChange={(value) => {
    setSelectedChapter(value); // Set the chapter ID as selectedChapter
    setSelectedTopic("");
    setSelectedQuestion(null);
    setCurrentPage(1);
    setMyCurrentPage(1);
  }}
  filterOption={(input, option) =>
    (option.label ?? "").toLowerCase().includes(input.toLowerCase())
  }
  options={chapterList?.map((chapter) => ({
    value: chapter._id, // Use chapter ID here
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
  value={selectedTopic} // selectedTopic should hold the topic ID
  filterOption={(input, option) =>
    (option.label ?? "").toLowerCase().includes(input.toLowerCase())
  }
  onChange={(value) => {
    setSelectedTopic(value); // value will now be the topic ID
    setCurrentPage(1);
    setMyCurrentPage(1);
  }}
  options={topicList?.map((el) => ({
    value: el._id, // Assuming each topic has a unique `_id` for its ID
    label: el.name,
  }))}
/>

              </div>
            </div>
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
                  <Tab.Panel
                    key="all-questions"
                    className="rounded-xl bg-white p-3"
                  >
                    <div className="max-h-64 overflow-y-auto">
                      {loading ? (
                        <Loading />
                      ) : (
                        <>
                         <h3 className="text-lg font-medium text-gray-900 mb-4">
                         Total Questions: {
    isTagged === "tagged"
      ? totalTagged
      : isTagged === "untagged"
      ? totalUntagged
      : isTagged === "new"
      ? totalNew
      : totalQuestions
  }</h3>

                          {totalQuestions === 0 ? (
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
                                <b>
                                  Q.
                                  {(currentPage - 1) * questionsPerPage + index + 1}
                                </b>
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: question.question,
                                  }}
                                />

{question.mode === "live" && (
  <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-full animate-pulse shadow-md">
    NEW
  </span>
)}
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
  Total Questions: {isTagged === 'tagged' ? totalMyTagged : isTagged === 'untagged' ? totalMyUntagged : totalMyQuestions}
</h3>



      {totalMyQuestions === 0 ? (
        <div className="text-center text-gray-500">No questions found.</div>
      ) : (
        myQuestions.map((question, index) => (
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
                        {totalMyQuestions === 0 ? "0 / " : `${myCurrentPage} / `}
                      </span>
                      <span className="text-gray-900">
                        {totalMyQuestions === 0 ? "0" : myTotalPages}
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
      </div>
      <div className="question_box pt-14">

        {selectedQuestion ? (
          <div className="box relative flex flex-col mt-6 m-7 text-white-700 shadow-md bg-clip-border rounded-xl">

            <div className="p-6">
              <div className="p-6 pt-0">
                {tagStatus && (
                  <button
                    className={`ml-4 align-middle select-none font-sans font-bold text-center uppercase transition-all text-xs py-3 px-6 rounded-lg 
          ${tagStatus === "Tagged" ? "bg-green-500" : "bg-red-500"} text-white`}
                    type="button"
                  >
                    {tagStatus}
                  </button>
                )}
              </div>
              <h5 className="heading block mb-2 font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-white-900">
                <b>
                Q. {getQuestionNumber()}
                  </b>
                <span dangerouslySetInnerHTML={{ __html: selectedQuestion.question }} />
                <button
                  className="ml-2 text-blue-500"
                  onClick={() => handleEditQuestion(selectedQuestion)}
                >
                  <LuPencilLine />
                </button>
              </h5>

              {selectedQuestion.images && selectedQuestion.images.length > 0 && (
                <div className="mt-4">
                  {selectedQuestion.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`Image ${index + 1}`}
                      className="max-w-full h-auto mb-2"
                    />
                  ))}
                </div>
              )}

              <div className="options">
                <p>Options: </p>
                {selectedQuestion.options && selectedQuestion.options.length > 0 ? (
                  selectedQuestion.options.map((option, idx) => (
                    <div key={idx} className="mb-4">
                      {option.images && option.images.length > 0 && (
                        <div className="mt-2 ml-2">
                          {option.images.map((image, index) => (
                            <img
                              key={index}
                              src={image.url}
                              alt={`Option ${option.name} Image ${index + 1}`}
                              className="max-w-20 h-20 mb-2"
                            />
                          ))}
                        </div>
                      )}
                      <label className="option">
                        <input
                          type="radio"
                          name={`option_${selectedQuestion._id}`}
                          value={option.name}
                          checked={option.tag === "Correct"}
                        />
                        <span
                          className="option-text"
                          dangerouslySetInnerHTML={{ __html: option.name }}
                        />
                        <button
                          className="ml-2 text-blue-500"
                          onClick={() => handleEditOption(option)}
                        >
                          <LuPencilLine />
                        </button>
                      </label>
                    </div>
                  ))
                ) : (
                  <p>No options available</p>
                )}
              </div>

              <p>Class: {selectedQuestion.standard}</p>
              <p>Subject: {selectedQuestion.subject}</p>
              <p>Chapter: {selectedQuestion.chapter.join(", ")}</p>
              <p>
                Topics: {selectedQuestion && selectedQuestion.topics ? selectedQuestion.topics.join(", ") : "No topics available"}
              </p>

              <p>Level: {selectedQuestion.level}</p>
              <p>
                Subtopics:{" "}
                {selectedQuestion.subtopics.length > 0
                  ? selectedQuestion.subtopics.join(", ")
                  : "N/A"}
              </p>
              <p>Nested Subtopic: {selectedQuestion.nestedSubTopic || "N/A"}</p>
            </div>
            
            <div className="p-6 pt-0">
              <button
                className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg bg-red-700 text-white shadow-md shadow-red-700/10 hover:shadow-lg hover:shadow-red-700/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none"
                type="button"
                onClick={() => handleDelete(selectedQuestion._id)}
              >
                Delete
              </button>

              {isAdmin && (
                <button
                  className="ml-4 align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg bg-blue-700 text-white shadow-md shadow-blue-700/10 hover:shadow-lg hover:shadow-blue-700/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none"
                  type="button"
                  onClick={() => handleEdit(selectedQuestion)}
                >
                  Edit
                </button>
              )}
            </div>
            <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full max-w-md p-4">
            {activeTabIndex === 0 && (
  <div className="flex justify-between p-4 w-full max-w-md">
    <button
      onClick={handlePrevQuestion}
      disabled={!selectedQuestion || filteredQuestions.findIndex(q => q._id === selectedQuestion?._id) === 0}
      className={`bg-blue-500 text-white px-4 py-2 rounded flex items-center ${!selectedQuestion || filteredQuestions.findIndex(q => q._id === selectedQuestion?._id) === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      Prev
    </button>
    <button
      onClick={handleNextQuestion}
      disabled={!selectedQuestion || filteredQuestions.findIndex(q => q._id === selectedQuestion?._id) === filteredQuestions.length - 1}
      className={`bg-blue-500 text-white px-4 py-2 rounded flex items-center ${!selectedQuestion || filteredQuestions.findIndex(q => q._id === selectedQuestion?._id) === filteredQuestions.length - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      Next
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    </button>
  </div>
)}

{activeTabIndex === 1 && (
  <div className="flex justify-between p-4 w-full max-w-md">
    <button
      onClick={handleMyPrevPage}
      disabled={!selectedQuestion || filteredMyQuestions.findIndex(q => q._id === selectedQuestion?._id) === 0}
      className={`bg-blue-500 text-white px-4 py-2 rounded flex items-center ${!selectedQuestion || filteredMyQuestions.findIndex(q => q._id === selectedQuestion?._id) === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      Prev
    </button>
    <button
      onClick={handleMyNextPage}
      disabled={!selectedQuestion || filteredMyQuestions.findIndex(q => q._id === selectedQuestion?._id) === filteredMyQuestions.length - 1}
      className={`bg-blue-500 text-white px-4 py-2 rounded flex items-center ${!selectedQuestion || filteredMyQuestions.findIndex(q => q._id === selectedQuestion?._id) === filteredMyQuestions.length - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      Next
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    </button>
  </div>
)}
   
   </div>
   </div>
          </div>
        ) : (
          <div>No question selected</div>
        )}
        {isEditModalOpen && (
          <div
            id="modalOverlay"
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleModalClick}
          >
            <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 sm:w-2/3 md:w-1/2 lg:w-1/3 xl:w-1/4 text-gray-900">
              <h3 className="text-xl mb-4">
                {editedOption.id ? "Edit Option" : "Edit Question"}
              </h3>
              {editedOption.id ? (
                <>
                  <label className="block mb-2">Option Name:</label>
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-800 p-2 rounded"
                    onClick={() => setShowOptionSymbols(!showOptionSymbols)}
                  >
                    &#x221A;
                  </button>
                  {showOptionSymbols && renderMathSymbols(insertOptionSymbol)}
                  <ReactQuill
                    ref={quillRef}
                    value={editedOption.name}
                    onChange={handleOptionNameChange}
                    theme="snow"
                    modules={{
                      toolbar: [
                        [{ 'font': [] }, { 'size': [] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'script': 'sub' }, { 'script': 'super' }],
                        [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                        [{ 'align': [] }],
                        ['link', 'formula'],
                      ],
                    }}
                  />
                  <label className="block mb-2 mt-4">Tag:</label>
                  <select
                    className="border rounded-lg p-2 w-full"
                    value={editedOption.tag}
                    onChange={handleOptionTagChange}
                  >
                    <option value="">Select Tag</option>
                    <option value="Correct">Correct</option>
                    <option value="InCorrect">InCorrect</option>
                  </select>
                </>
              ) : (
                <>
                  <label className="block mb-2">Question:</label>
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-800 p-2 rounded"
                    onClick={() => setShowSymbols(!showSymbols)}
                  >
                    &#x221A;
                  </button>
                  {showSymbols && renderMathSymbols(insertSymbol)}
                  <ReactQuill
                    ref={quillRef}
                    value={editedQuestion}
                    onChange={handleTextareaChange}
                    theme="snow"
                    modules={{
                      toolbar: [
                        [{ 'font': [] }, { 'size': [] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'script': 'sub' }, { 'script': 'super' }],
                        [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                        [{ 'align': [] }],
                        ['link', 'formula'],
                      ],
                    }}
                  />
                </>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                  onClick={handleSaveChanges}
                >
                  Save
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {isModalOpen && (
          <EditModel
            isOpen={isModalOpen}
            onClose={closeModals}
            selectedQuestion={selectedQuestion}
            onSave={handleSaveEdits}
            setIsModalOpen={setIsEditModalOpen}
          />
        )}
      </div>
    </>

  );
};

export default ProfileHead;
