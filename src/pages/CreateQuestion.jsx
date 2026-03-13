import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select } from "antd";
import toast from "react-hot-toast";
import axios from "axios";
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
import { FaRobot } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import ReactQuill from "react-quill";
import "./CreateQuestion.css"
import "react-quill/dist/quill.snow.css";
import { server } from "../main.jsx";

const CreateQuestion = () => {
  const dispatch = useDispatch();
  const quillRef = useRef(null);
  const [standard, setStandard] = useState(null);
  const [subject, setSubject] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [topic, setTopic] = useState(null);
  const [level, setLevel] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedSubtopics, setSelectedSubtopics] = useState([]);
  const [optionImages, setOptionImages] = useState([]);
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState([""]);
  const [correctOptions, setCorrectOptions] = useState([""]);
  const [isSubtopicsLoading, setIsSubtopicsLoading] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);

  // AI generation state
  const [aiCount, setAiCount] = useState(5);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState([]);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isPromptCustomized, setIsPromptCustomized] = useState(false);
  const [insertingSet, setInsertingSet] = useState(new Set());
  const [insertedSet, setInsertedSet] = useState(new Set());
  const [insertAllLoading, setInsertAllLoading] = useState(false);
  const [includeSolutions, setIncludeSolutions] = useState(false);
  // Tracks which question cards have their solution accordion open
  const [openSolutions, setOpenSolutions] = useState(new Set());

  // const [topicList, setTopicList] =useState([])
  const { subjectList } = useSelector((state) => state.getSubject);
  const { chapterList } = useSelector((state) => state.getChapter);
  const { topicList } = useSelector((state) => state.getTopic);
  const { subtopics } = useSelector((state) => state.getSubtopic);
  const { isLoading: questionLoading } = useSelector((state) => state.question);
  const [appendedSymbols, setAppendedSymbols] = useState(Array.from({ length: options.length }, () => ''));


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
  

  const insertSymbol = (symbol) => {
    setQuestion((prev) => `${prev}${symbol}`);
    setShowSymbols(false);
  };

  const appendSymbolToOption = (symbol, index) => {
    // Clone the current appendedSymbols array
    const newAppendedSymbols = [...appendedSymbols];
    // Append the symbol to the specified option index
    newAppendedSymbols[index] += symbol;
    // Update the appendedSymbols state with the new array
    setAppendedSymbols(newAppendedSymbols);

    // Clone the current options array
    const newOptions = [...options];
    // Append the symbol to the specified option index
    newOptions[index] += symbol;
    // Update the options state with the new array
    setOptions(newOptions);

    // Optionally, close the symbol panel after insertion
    setShowSymbols(false);
  };
  


  const renderMathSymbols = () => (
    <div className="overflow-y-auto h-32 border bg-white text-gray-900 border-gray-300 rounded p-2">
      <ol className="space-y-0 flex flex-wrap gap-2">
        {mathSymbols.map((item) => (
          <li key={item.symbol}>
            <button onClick={() => insertSymbol(item.symbol)} className="p-2 rounded border border-gray-400 hover:bg-gray-200">
              {item.symbol}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );

  
  const renderSymbols = (index) => (
    <div className="overflow-y-auto h-32 border bg-white text-gray-900 border-gray-300 rounded p-2">
      <ol className="space-y-0 flex flex-wrap gap-2">
        {mathSymbols.map((item) => (
          <li key={item.symbol}>
            <button
              onClick={() => appendSymbolToOption(item.symbol, index)}
              className="p-2 rounded border border-gray-400 hover:bg-gray-200"
            >
              {item.symbol}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
  
  
  
  const fetchTopics = async () => {
    if (subject && standard && chapter && chapter.length > 0) {
      try {
        const chapterIds = chapter.map(chap => chap._id).join(',');
  
        dispatch(getTopics(subject, standard, chapterIds));
        
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    }
  };
  
  
  useEffect(() => {
    if (standard) {
      dispatch(getSubjects(standard)); // Fetch subjects based on the standard
    }
  
    if (subject && standard) {
      dispatch(getChapters(subject, standard)); // Fetch chapters based on subject and standard
    }
  

    
    fetchTopics();
    
  
    if (subject && standard && chapter && topic) {
      setIsSubtopicsLoading(true);
    
      const chapterIds = chapter.map(el => el._id).join(',');
      const topicIds = topic.map(el => el._id).join(',');
    
      dispatch(getSubtopics(subject, standard, chapterIds, topicIds))
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

  // ── Build the default AI prompt whenever scope fields change ────────────────
  const buildDefaultPrompt = (count = aiCount) => {
    const chapterNames = (chapter || []).filter((c) => c && c.name).map((c) => c.name).join(", ") || "";
    const topicNames   = topic && topic.length > 0
      ? topic.filter(Boolean).map((t) => t.name).join(", ")
      : null;
    const subtopicNames = selectedSubtopics && selectedSubtopics.length > 0
      ? selectedSubtopics.filter(Boolean).map((s) => s.name).join(", ")
      : null;

    const parts = [
      `Generate ${count} high-quality MCQ questions for Class ${standard || "__"} ${subject || "__"},`,
      `Chapter: ${chapterNames || "__"}.`,
      topicNames   ? `Topics: ${topicNames}.`    : "",
      subtopicNames ? `Subtopics: ${subtopicNames}.` : "",
      level        ? `Exam level: ${level}.`     : "",
      "Ensure questions are curriculum-aligned, unambiguous, and have exactly 4 options with one correct answer.",
    ].filter(Boolean).join(" ");

    return parts;
  };

  // Keep the textarea in sync with dropdown selections — only if the user
  // hasn't manually edited the prompt yet.
  useEffect(() => {
    if (!isPromptCustomized) {
      setCustomPrompt(buildDefaultPrompt());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standard, subject, chapter, topic, selectedSubtopics, level, aiCount, isPromptCustomized]);
  

  const uploadImageToS3 = async (file, signedUrl) => {
    const response = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!response.ok) {
      toast.error(`Image upload failed: ${file.name}`)
      throw new Error("Failed to upload image to S3");
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!question || !question.replace(/<[^>]*>/g, '').trim()) {
      toast.error("Question field is compulsory");
      return;
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
  
    console.log(topic,chapter, selectedSubtopics, "here is the topic")
    const formattedData = {
      question: question,
      options: filteredOptions.map((option, index) => ({
        name: option,
        image: formattedOptionImages[index] ? [formattedOptionImages[index]] : [],
        isCorrect: correctOptions.includes(index),
      })),
      images: formattedQuestionImage,
      standard,
      subject,
      chapter,
      topics: topic,
      subtopics: selectedSubtopics,
      level,
      
    };
  
    try { 
       const hasCorrectOption = formattedData.options.some(
      (option) => option.isCorrect
    );
    if (!hasCorrectOption) {
      toast.error("At least one option must be correct.");
      return;
    }

      const response = await dispatch(createQuestion(formattedData));
  
      const { signedUrls, optionsSignedUrls } = response;
  
      const uploadQuestionImages = images.map((file, index) => {
        const signedUrl = signedUrls[index];
        return uploadImageToS3(file, signedUrl);
      });
  
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
      // toast.error("Failed to create question. Please try again.");
    }
  };

  const handleInputChange = (index, value) => {
    // Update options array with the new value
    const newOptions = [...options];
    newOptions[index] = value;
  
    if (index === newOptions.length - 1 && newOptions[index].trim() !== "" && newOptions.length < 4) {
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
  // const handleOptionImageUpload = (index, event) => {
  //   const files = Array.from(event.target.files);
  //   const updatedImages = [...optionImages];
  //   updatedImages[index] = files[0]; 
  //   setOptionImages(updatedImages);
  // };

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
    setQuestion("")
    setOptions([]);
    setCorrectOptions([""]);
    setIsSubtopicsLoading(false);
    setImages([]); // Clear question images
    setOptionImages([]); 
  };

  // const handleSubtopicChange = (value, options, level) => {
  //   const updatedSubtopics = [...selectedSubtopics];
  
  //   // If at the root level, use the subtopics array directly; otherwise, access the nested subtopics
  //   const parentSubtopics = level === 0 ? subtopics : updatedSubtopics[level - 1]?.subtopics;
  
  //   // Find the selected subtopics by matching _id with value
  //   const selectedSubtopicsAtLevel = options.map((option) => {
  //     return parentSubtopics.find((sub) => sub._id === option.value);
  //   }).filter(Boolean); // Filter out any null or undefined results
  
  //   // Set the selected subtopics at the current level
  //   updatedSubtopics[level] = selectedSubtopicsAtLevel.map((subtopic) => ({
  //     _id: subtopic._id,
  //     name: subtopic.name,
  //   }));
  
  //   setSelectedSubtopics(updatedSubtopics);
  // };

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

  // const renderSubtopicSelectors = (currentSubtopics, level) => {
  //   if (!currentSubtopics || currentSubtopics.length === 0) {
  //       return null;
  //   }


  //   return (
  //       <div key={level} className="relative z-0 w-full mb-5 group flex flex-col">
  //           <label
  //               htmlFor={`subtopic-select-${level}`}
  //               className="block text-sm dark:text-white-400"
  //           >
  //               {level === 0 ? "Subtopic" : `Nested Subtopic`}
  //           </label>

  //           <Select
  //               mode="multiple"
  //               id={`subtopic-select-${level}`}
  //               showSearch
  //               style={{ width: 200 }}
  //               placeholder={`Select ${level === 0 ? "Subtopic" : `Nested Subtopic`}`}
  //               filterOption={(input, option) =>
  //                 (option.label ?? "").toLowerCase().includes(input.toLowerCase())
  //              }
  //               options={currentSubtopics.map((subtopic) => ({
  //                   value: subtopic._id,
  //                   label: subtopic.name,
  //               }))}
  //               onChange={(value) => handleSubtopicChange(value, level)}
  //           />

  //           {currentSubtopics.map((subtopic) => (
  //               <div key={`${subtopic._id}-${level}`} className="mt-3 ml-6">
  //                   {renderSubtopicSelectors(subtopic.subtopics, level + 1)}
  //               </div>
  //           ))}
  //       </div>
  //   );
  // }

  // ── AI insert helpers ────────────────────────────────────────────────────────

  /** Map an AI-generated question object to the format expected by POST /api/create/question */
  const buildQuestionPayload = (q) => {
    // Match AI topic/subtopic names against Redux lists to get {_id, name} objects.
    // Fall back to the form-selected arrays if no match.
    const resolvedTopics = (() => {
      if (q.topics && q.topics.length > 0 && topicList?.length > 0) {
        const matched = q.topics
          .map((name) => topicList.find((t) => t?.name?.toLowerCase() === name?.toLowerCase()))
          .filter(Boolean)
          .map((t) => ({ _id: t._id, name: t.name }));
        if (matched.length > 0) return matched;
      }
      return (topic || []).filter(Boolean);
    })();

    const resolvedSubtopics = (() => {
      if (q.subtopics && q.subtopics.length > 0 && subtopics?.length > 0) {
        const matched = q.subtopics
          .map((name) => subtopics.find((s) => s?.name?.toLowerCase() === name?.toLowerCase()))
          .filter(Boolean)
          .map((s) => ({ _id: s._id, name: s.name }));
        if (matched.length > 0) return matched;
      }
      return (selectedSubtopics || []).filter(Boolean);
    })();

    // Sanitise chapter: remove any null/undefined entries and ensure _id exists
    const safeChapter = (chapter || []).filter((c) => c && c._id);

    return {
      question: q.question,
      options: q.options.map((opt) => ({
        name: opt.name,
        isCorrect: opt.isCorrect,
        image: [],
      })),
      images: [],
      standard,
      subject,
      chapter: safeChapter,
      topics: resolvedTopics,
      subtopics: resolvedSubtopics,
      level: level || q.level || "",
    };
  };

  const handleInsertOne = async (qi) => {
    const q = aiGeneratedQuestions[qi];
    if (!q) return;

    setInsertingSet((prev) => new Set(prev).add(qi));
    try {
      // 1. Save the question first to get its _id
      const qRes = await axios.post(`${server}/api/create/question`, buildQuestionPayload(q), {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      const questionId = qRes.data?.question?._id;

      // 2. Save solution linked to the question (if present)
      if (questionId && q.solution && q.solution.content) {
        await axios.post(
          `${server}/api/solution/create`,
          { questionId, content: q.solution.content },
          { withCredentials: true, headers: { "Content-Type": "application/json" } }
        );
      }

      setInsertedSet((prev) => new Set(prev).add(qi));
      toast.success("Question saved to database!");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save question.";
      toast.error(msg);
    } finally {
      setInsertingSet((prev) => { const s = new Set(prev); s.delete(qi); return s; });
    }
  };

  const handleDiscardOne = (qi) => {
    setAiGeneratedQuestions((prev) => prev.filter((_, i) => i !== qi));
    setInsertedSet((prev) => {
      // Re-index: remove qi and shift all higher indices down by 1
      const next = new Set();
      prev.forEach((idx) => { if (idx < qi) next.add(idx); else if (idx > qi) next.add(idx - 1); });
      return next;
    });
  };

  const handleInsertAll = async () => {
    const pending = aiGeneratedQuestions
      .map((_, i) => i)
      .filter((i) => !insertedSet.has(i));

    if (pending.length === 0) {
      toast("All questions already inserted.");
      return;
    }

    setInsertAllLoading(true);
    let successCount = 0;

    await Promise.allSettled(
      pending.map(async (qi) => {
        const q = aiGeneratedQuestions[qi];
        setInsertingSet((prev) => new Set(prev).add(qi));
        try {
          // Save question first, then link solution to it
          const qRes = await axios.post(`${server}/api/create/question`, buildQuestionPayload(q), {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          });
          const questionId = qRes.data?.question?._id;

          if (questionId && q.solution && q.solution.content) {
            await axios.post(
              `${server}/api/solution/create`,
              { questionId, content: q.solution.content },
              { withCredentials: true, headers: { "Content-Type": "application/json" } }
            );
          }

          setInsertedSet((prev) => new Set(prev).add(qi));
          successCount++;
        } catch {
          // individual failures are silently tracked; overall toast shown below
        } finally {
          setInsertingSet((prev) => { const s = new Set(prev); s.delete(qi); return s; });
        }
      })
    );

    setInsertAllLoading(false);
    if (successCount > 0) toast.success(`${successCount} question${successCount !== 1 ? "s" : ""} saved!`);
    if (successCount < pending.length) toast.error(`${pending.length - successCount} question(s) failed to save.`);
  };

  const handleGenerateWithAI = async () => {
    if (!standard || !subject || !chapter || chapter.length === 0) {
      toast.error("Please select at least Standard, Subject, and Chapter before generating.");
      return;
    }

    const count = Math.max(1, Math.min(20, Number(aiCount) || 5));
    const safeChapter   = (chapter || []).filter((c) => c && c._id);
    const chapterNames  = safeChapter.map((c) => c.name).join(", ");
    const topicNames    = topic && topic.length > 0 ? topic.filter(Boolean).map((t) => t.name).join(", ") : null;
    const subtopicNames = selectedSubtopics && selectedSubtopics.length > 0
      ? selectedSubtopics.filter(Boolean).map((s) => s.name).join(", ")
      : null;

    // Use the (possibly customized) prompt from the textarea
    const message = customPrompt.trim() || buildDefaultPrompt(count);

    setAiLoading(true);
    setAiGeneratedQuestions([]);
    setInsertedSet(new Set());
    setInsertingSet(new Set());
    setOpenSolutions(new Set());
    setShowAiPanel(true);

    try {
      const { data } = await axios.post(
        `${server}/api/agent/run`,
        {
          agentType: "question",
          message,
          standard,
          subject,
          chapter: chapterNames,
          ...(topicNames    && { topic: topicNames }),
          ...(subtopicNames && { subtopic: subtopicNames }),
          ...(level         && { level }),
          includeSolutions,
        },
        { withCredentials: true }
      );

      const questions = Array.isArray(data?.questions) ? data.questions : [];
      setAiGeneratedQuestions(questions);
      toast.success(`${questions.length} question${questions.length !== 1 ? "s" : ""} generated!`);
    } catch (err) {
      console.error("[AI Generate]", err);
      toast.error(err?.response?.data?.message || "AI generation failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main className="p-4">
      <h1 className="text-center m-10 text-white-600">Create Questions</h1>
      <form className="max-w-md mx-auto" onSubmit={handleFormSubmit}>
      <div className="flex flex-wrap gap-5 mb-5">

  <div className="relative z-0 w-full md:w-auto flex flex-col-reverse group">
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
    <label className="text-white-500 text-sm dark:text-white-400 mt-1">
      Standard
    </label>
  </div>

  <div className="relative z-0 w-full md:w-auto flex flex-col-reverse group">
    <Select
      showSearch
      style={{ width: 200 }}
      placeholder="Select Subject"
      filterOption={(input, option) =>
        (option.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
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
    <label className="text-white-500 text-sm dark:text-white-400 mt-1">
      Subject
    </label>
  </div>

  <div className="relative z-0 w-full md:w-auto flex flex-col-reverse group">
  <Select
  mode="multiple"
  showSearch
  style={{ width: 200 }}
  placeholder="Select Chapter"
  filterOption={(input, option) =>
    (option.label ?? "").toLowerCase().includes(input.toLowerCase())
  }
  onChange={async (values, options) => {
    const selectedChapters = options.map(option => ({
      _id: option.value,
      name: option.label,
    }));
    setChapter(selectedChapters);
    setTopic(null);
    setSelectedSubtopics([]);
    setIsSubtopicsLoading(true);
    await fetchTopics(); // Fetch topics after setting chapters
    setIsSubtopicsLoading(false);
  }}
  options={chapterList?.map(chapter => ({
    value: chapter._id,
    label: chapter.name,
  }))}
  value={chapter?.map(el => el._id)}
  labelInValue
/>

    <label className="text-white-500 text-sm dark:text-white-400 mt-1">
      Chapter
    </label>
  </div>

  <div className="relative z-0 w-full md:w-auto flex flex-col-reverse group">
  <Select
  mode="multiple"
  showSearch
  style={{ width: 200 }}
  placeholder="Select Topics"
  filterOption={(input, option) =>
    (option.label ?? "").toLowerCase().includes(input.toLowerCase())
  }
  onChange={(values, options) => {
    const selectedTopics = options.map(option => ({
      _id: option.value,
      name: option.label,
    }));
    setTopic(selectedTopics);
    setSelectedSubtopics([]);
  }}
  options={topicList?.map(el => ({
    value: el._id,
    label: el.name,
  }))}
  value={topic?.map(el => el._id)}
  labelInValue
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
  
</div>


        {topic && subtopics && subtopics.length > 0 && (
         <Select
         mode="multiple"
         id={`subtopic-select-${level}`}
         showSearch
         style={{ width: 200 }}
         placeholder={`Select ${level === 0 ? "Subtopic" : `Nested Subtopic`}`}
         filterOption={(input, option) =>
           (option.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
         options={subtopics.map((subtopic) => ({
             value: subtopic._id,
             label: subtopic.name,
         }))}
         onChange={(values, options) => {
           // Set topics with both _id and name
           const selectedSubtopics = options.map(option => ({
             _id: option.value, // this is the topic _id
             name: option.label, // this is the topic name
           }));
           setSelectedSubtopics(selectedSubtopics);
         }}
         // Map over topic array to display names in the value
         value={selectedSubtopics?.map(el => ({ value: el._id, label: el.name }))}
         labelInValue
       />
        )}

        <div className="relative z-0 w-full mb-8 group flex flex-col-reverse">
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select Level"
            filterOption={(input, option) =>
              (option.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
            onChange={(value) => setLevel(value)}
            value={level}
            options={[
              { value: "boards", label: "Boards" },
              { value: "neet", label: "Neet" },
              { value: "jeemains_easy", label: "JeeMains_Easy" },
              { value: "jeemains", label: "JeeMains" },
              { value: "jeeadvance", label: "JeeAdvance" },
            ]}
          />
          <label className="text-white-500 text-sm dark:text-white-400">
            Level
          </label>
        </div>

        {/* ── AI Question Generator Panel ─────────────────────────────── */}
        <div className="w-full mb-6 rounded-xl border border-dashed border-purple-500 bg-purple-950/30 p-4">
          {/* Header row */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <FaRobot className="text-purple-400 text-xl flex-shrink-0" />
            <span className="text-purple-300 font-semibold text-sm">Generate Questions with AI</span>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <label className="text-purple-300 text-xs">Questions:</label>
              <input
                type="number"
                min={1}
                max={20}
                value={aiCount}
                onChange={(e) => setAiCount(e.target.value)}
                className="w-16 rounded-md border border-purple-500 bg-transparent text-white text-center text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />

              {/* Solutions toggle */}
              <button
                type="button"
                onClick={() => setIncludeSolutions((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  includeSolutions
                    ? "bg-amber-500/20 border-amber-400 text-amber-300"
                    : "bg-transparent border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-300"
                }`}
                title="Toggle to generate a worked solution for each question"
              >
                <span className={`w-3 h-3 rounded-full inline-block flex-shrink-0 ${includeSolutions ? "bg-amber-400" : "bg-gray-600"}`} />
                Solutions
              </button>

              <button
                type="button"
                disabled={aiLoading || !standard || !subject || !chapter || chapter.length === 0}
                onClick={handleGenerateWithAI}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
              >
                {aiLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Generating…
                  </>
                ) : (
                  <>
                    <FaRobot className="text-sm" /> Generate
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Prompt textarea */}
          <div className="mt-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-purple-300 text-xs font-medium">
                Prompt
                {isPromptCustomized && (
                  <span className="ml-2 text-yellow-400 text-xs">(customized)</span>
                )}
              </label>
              {isPromptCustomized && (
                <button
                  type="button"
                  onClick={() => {
                    setIsPromptCustomized(false);
                    setCustomPrompt(buildDefaultPrompt());
                  }}
                  className="text-purple-400 hover:text-purple-200 text-xs underline underline-offset-2"
                >
                  Reset to default
                </button>
              )}
            </div>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => {
                setCustomPrompt(e.target.value);
                setIsPromptCustomized(true);
              }}
              placeholder={
                !standard || !subject || !chapter || chapter.length === 0
                  ? "Select Standard, Subject, and Chapter to see the default prompt…"
                  : ""
              }
              className="w-full rounded-lg border border-purple-500/60 bg-purple-950/40 text-purple-100 text-xs px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder-purple-600"
            />
          </div>

          {(!standard || !subject || !chapter || chapter.length === 0) && (
            <p className="text-purple-400/70 text-xs mt-2">
              Select Standard, Subject, and Chapter above to enable AI generation.
            </p>
          )}
        </div>

        {/* ── AI Generated Questions Preview ─────────────────────────── */}
        {showAiPanel && (
          <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-purple-300 font-semibold text-base flex items-center gap-2">
                <FaRobot /> AI Generated Questions
                {!aiLoading && aiGeneratedQuestions.length > 0 && (
                  <span className="text-xs text-gray-400 font-normal">
                    ({insertedSet.size}/{aiGeneratedQuestions.length} saved)
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2">
                {!aiLoading && aiGeneratedQuestions.length > 0 && (
                  <button
                    type="button"
                    disabled={insertAllLoading || insertedSet.size === aiGeneratedQuestions.length}
                    onClick={handleInsertAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                  >
                    {insertAllLoading ? (
                      <>
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Inserting…
                      </>
                    ) : insertedSet.size === aiGeneratedQuestions.length ? (
                      <><FaCheck className="text-xs" /> All Inserted</>
                    ) : (
                      "Insert All"
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setShowAiPanel(false); setAiGeneratedQuestions([]); setInsertedSet(new Set()); }}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {aiLoading && (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <svg className="animate-spin h-8 w-8 text-purple-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <p className="text-purple-300 text-sm animate-pulse">AI is generating questions…</p>
                <p className="text-gray-500 text-xs">This may take 30–60 seconds</p>
              </div>
            )}

            {!aiLoading && aiGeneratedQuestions.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-6">No questions to display yet.</p>
            )}

            {!aiLoading && aiGeneratedQuestions.length > 0 && (
              <div className="flex flex-col gap-4">
                {aiGeneratedQuestions.map((q, qi) => {
                  const isInserting = insertingSet.has(qi);
                  const isInserted  = insertedSet.has(qi);

                  return (
                    <div
                      key={qi}
                      className={`rounded-xl border p-4 transition-colors ${
                        isInserted
                          ? "border-green-700 bg-green-950/30"
                          : "border-gray-700 bg-gray-800/60"
                      }`}
                    >
                      {/* Question text */}
                      <div className="flex items-start gap-2 mb-3">
                        <span className="text-purple-400 font-bold text-sm flex-shrink-0">Q{qi + 1}.</span>
                        <div
                          className="text-white text-sm leading-relaxed [&_*]:text-white"
                          dangerouslySetInnerHTML={{ __html: q.question }}
                        />
                      </div>

                      {/* Options */}
                      {q.options && q.options.length > 0 && (
                        <div className="flex flex-col gap-1.5 ml-5">
                          {q.options.map((opt, oi) => (
                            <div
                              key={oi}
                              className={`flex items-start gap-2 rounded-lg px-3 py-1.5 text-sm ${
                                opt.isCorrect
                                  ? "bg-green-900/50 border border-green-600 text-green-300"
                                  : "bg-gray-700/40 border border-gray-600 text-gray-300"
                              }`}
                            >
                              <span className="font-medium flex-shrink-0">
                                {String.fromCharCode(65 + oi)}.
                              </span>
                              <span dangerouslySetInnerHTML={{ __html: opt.name }} />
                              {opt.isCorrect && (
                                <FaCheck className="text-green-400 ml-auto flex-shrink-0 mt-0.5" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Solution accordion */}
                      {q.solution && q.solution.content && (
                        <div className="ml-5 mt-3">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenSolutions((prev) => {
                                const next = new Set(prev);
                                next.has(qi) ? next.delete(qi) : next.add(qi);
                                return next;
                              })
                            }
                            className="flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                          >
                            <span
                              className={`transition-transform inline-block ${openSolutions.has(qi) ? "rotate-90" : ""}`}
                            >
                              ▶
                            </span>
                            Solution
                          </button>

                          {openSolutions.has(qi) && (
                            <div className="mt-2 rounded-lg border border-amber-700/50 bg-amber-950/20 px-4 py-3 text-xs text-amber-100 prose prose-invert prose-xs max-w-none
                              [&_h1]:text-amber-300 [&_h2]:text-amber-300 [&_h3]:text-amber-300
                              [&_strong]:text-amber-200 [&_code]:bg-amber-900/40 [&_code]:px-1 [&_code]:rounded
                              [&_pre]:bg-amber-900/40 [&_pre]:rounded [&_pre]:p-2
                              [&_hr]:border-amber-700/40 [&_p]:leading-relaxed [&_li]:leading-relaxed">
                              <ReactMarkdown>{q.solution.content}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tags row + action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 ml-5">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {q.level && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300 border border-blue-700">
                              {q.level}
                            </span>
                          )}
                          {q.topics && q.topics.map((t, ti) => (
                            <span key={ti} className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                              {t.name || t}
                            </span>
                          ))}
                        </div>

                        {/* Insert / Discard buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isInserted ? (
                            <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                              <FaCheck /> Inserted
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={isInserting}
                              onClick={() => handleInsertOne(qi)}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white transition-colors"
                            >
                              {isInserting ? (
                                <>
                                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                  </svg>
                                  Inserting…
                                </>
                              ) : (
                                "Insert"
                              )}
                            </button>
                          )}
                          {!isInserted && (
                            <button
                              type="button"
                              disabled={isInserting}
                              onClick={() => handleDiscardOne(qi)}
                              className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-900/60 hover:bg-red-800 disabled:opacity-60 text-red-300 hover:text-white transition-colors"
                            >
                              Discard
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="relative z-0 w-full mb-5 group">
          <div className="relative flex items-center">
           
          <div className="mt-5">
          <button
                type="button"
                onClick={() => setShowSymbols((prev) => !prev)}
                className="symbol-btn"
              >
                ∑
              </button>
            {showSymbols &&
                       renderMathSymbols()}
              
              <ReactQuill
              ref={quillRef}
                value={question}
                 className=" bg-slate-50 text-black"
                onChange={setQuestion}
                theme="snow"
                modules={{
                  toolbar: [
                    [{ 'font': [] }, { 'size': [] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            [ { 'align': [] }],
            ['link','formula'],
                  ],
                }}
              />
              
            </div>
          

            <label
              htmlFor="question"
              className="peer-focus:font-medium absolute text-lg text-white-500 dark:text-white-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-grey-600 peer-focus:dark:text-grey-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
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
              

            <div className="mt-5">
          
            <button
          type="button"
          onClick={() => setShowSymbols((prev) => !prev)}
          className="symbol-btn"
        >
          ∑
        </button>
        {showSymbols && renderSymbols(index)}
            <ReactQuill
            ref={quillRef}
            theme="snow"
            className=" bg-slate-200 text-black"
            value={option}
            onChange={(value) => handleInputChange(index, value)}
            modules={{
              toolbar: [
                ["bold", "italic", "underline", "strike", "blockquote"],
                ["link"],
                // ["clean"],
                [{ script: "sub" }, { script: "super" }], // Subscript and superscript
              ],
            }}
          
          />
          </div>
              <label
                htmlFor={`option-${index}`}
                className="peer-focus:font-medium absolute text-lg text-white-500 dark:text-white-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-white-600 peer-focus:dark:text-white-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Option {index + 1}
              </label>
              {/* <label
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
              /> */}
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
          Add options
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
