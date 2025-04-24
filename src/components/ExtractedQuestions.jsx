/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Select, Checkbox, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getSubjects } from "../actions/subjectAction";
import { getChapters } from "../actions/chapterAction";
import { getTopics } from "../actions/topicAction";
import { getSubtopics } from "../actions/subtopicAction";
import { standards } from "./Options";
import { FaArrowLeft, FaArrowRight, FaImage, FaTrash, FaUndo } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import { server } from "../main";
import "react-quill/dist/quill.snow.css";

const ExtractedQuestions = ({ questions, setQuestions, selectedStandard, selectedSubject, selectedChapter, selectedTopic }) => {
  const dispatch = useDispatch();
  const { subjectList } = useSelector((state) => state.getSubject);
  const { chapterList } = useSelector((state) => state.getChapter);
  const { topicList } = useSelector((state) => state.getTopic);
  const { subtopics } = useSelector((state) => state.getSubtopic);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [bulkStandard, setBulkStandard] = useState(selectedStandard);
  const [bulkSubject, setBulkSubject] = useState(selectedSubject);
  const [bulkChapter, setBulkChapter] = useState(selectedChapter || []);
  const [bulkTopics, setBulkTopics] = useState(selectedTopic || []);
  const [bulkSubtopics, setBulkSubtopics] = useState([]);
  const [bulkLevel, setBulkLevel] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Initialize metadata for each question if not already present
    const updatedQuestions = questions.map(question => ({
      ...question,
      standard: question.standard || null,
      subject: question.subject || null,
      chapter: question.chapter || [],
      topics: question.topics || [],
      subtopics: question.subtopics || [],
      level: question.level || null,
      image: question.image || null
    }));
    
    setQuestions(updatedQuestions);
  }, []);

  // Reset selected questions when page changes
  useEffect(() => {
    setSelectedQuestions([]);
  }, [currentPage]);

  // Handle file drop
  const handleDrop = (e, questionIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleImageUpload(files[0], questionIndex);
    }
  };
  
  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  // Handle image upload
  const handleImageUpload = (file, questionIndex) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const updatedQuestions = [...questions];
      updatedQuestions[questionIndex].image = e.target.result;
      setQuestions(updatedQuestions);
    };
    reader.readAsDataURL(file);
  };
  
  // Remove image
  const removeImage = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].image = null;
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex, optionIndex, newValue) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = newValue;
    setQuestions(updatedQuestions);
  };

  const setCorrectAnswer = (questionIndex, option) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correctAnswer = option;
    setQuestions(updatedQuestions);
  };

  const handleStandardChange = (value, questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].standard = value;
    updatedQuestions[questionIndex].subject = null;
    updatedQuestions[questionIndex].chapter = [];
    updatedQuestions[questionIndex].topics = [];
    setQuestions(updatedQuestions);
    
    dispatch(getSubjects(value));
  };

  const handleSubjectChange = (value, questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].subject = value;
    updatedQuestions[questionIndex].chapter = [];
    updatedQuestions[questionIndex].topics = [];
    setQuestions(updatedQuestions);
    
    if (updatedQuestions[questionIndex].standard) {
      dispatch(getChapters(value, updatedQuestions[questionIndex].standard));
    }
  };

  const handleChapterChange = (values, options, questionIndex) => {
    const updatedQuestions = [...questions];
    const selectedChapters = options.map(option => ({
      _id: option.value,
      name: option.label,
    }));
    
    updatedQuestions[questionIndex].chapter = selectedChapters;
    updatedQuestions[questionIndex].topics = [];
    setQuestions(updatedQuestions);
    
    if (selectedChapters.length > 0 && updatedQuestions[questionIndex].subject && updatedQuestions[questionIndex].standard) {
      const chapterIds = selectedChapters.map(chap => chap._id).join(',');
      dispatch(getTopics(updatedQuestions[questionIndex].subject, updatedQuestions[questionIndex].standard, chapterIds));
    }
  };

  const handleTopicChange = (values, options, questionIndex) => {
    const updatedQuestions = [...questions];
    const selectedTopics = options.map(option => ({
      _id: option.value,
      name: option.label,
    }));
    
    updatedQuestions[questionIndex].topics = selectedTopics;
    setQuestions(updatedQuestions);
    
    if (selectedTopics.length > 0 && updatedQuestions[questionIndex].subject && 
        updatedQuestions[questionIndex].standard && updatedQuestions[questionIndex].chapter) {
      const chapterIds = updatedQuestions[questionIndex].chapter.map(chap => chap._id).join(',');
      const topicIds = selectedTopics.map(topic => topic._id).join(',');
      dispatch(getSubtopics(updatedQuestions[questionIndex].subject, updatedQuestions[questionIndex].standard, chapterIds, topicIds));
    }
  };

  const handleSubtopicChange = (values, options, questionIndex) => {
    const updatedQuestions = [...questions];
    const selectedSubtopics = options.map(option => ({
      _id: option.value,
      name: option.label,
    }));
    
    updatedQuestions[questionIndex].subtopics = selectedSubtopics;
    setQuestions(updatedQuestions);
  };

  const handleLevelChange = (value, questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].level = value;
    setQuestions(updatedQuestions);
  };

  const questionsPerPage = 10;
  const totalQuestions = questions.length;
  
  // Get current page questions
  const getCurrentQuestions = () => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    return questions.slice(startIndex, endIndex);
  };

  // Handle question selection
  const handleSelectQuestion = (questionIndex, isChecked) => {
    const actualIndex = questionIndex + (currentPage - 1) * questionsPerPage;
    if (isChecked) {
      setSelectedQuestions([...selectedQuestions, actualIndex]);
    } else {
      setSelectedQuestions(selectedQuestions.filter(idx => idx !== actualIndex));
    }
  };

  // Handle select all questions on current page
  const handleSelectAllQuestions = (isChecked) => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    const endIndex = Math.min(startIndex + questionsPerPage, questions.length);
    
    if (isChecked) {
      const pageIndices = Array.from({ length: endIndex - startIndex }, (_, i) => startIndex + i);
      setSelectedQuestions([...selectedQuestions, ...pageIndices]);
    } else {
      const pageIndices = Array.from({ length: endIndex - startIndex }, (_, i) => startIndex + i);
      setSelectedQuestions(selectedQuestions.filter(idx => !pageIndices.includes(idx)));
    }
  };

  // Apply bulk metadata to selected questions
  const applyBulkMetadata = () => {
    if (selectedQuestions.length === 0) {
      toast.error("Please select at least one question");
      return;
    }

    const updatedQuestions = [...questions];
    
    selectedQuestions.forEach(questionIndex => {
      if (bulkStandard) {
        updatedQuestions[questionIndex].standard = bulkStandard;
      }
      
      if (bulkSubject) {
        updatedQuestions[questionIndex].subject = bulkSubject;
      }
      
      if (bulkChapter && bulkChapter.length > 0) {
        updatedQuestions[questionIndex].chapter = bulkChapter;
      }
      
      if (bulkTopics && bulkTopics.length > 0) {
        updatedQuestions[questionIndex].topics = bulkTopics;
      }
      
      if (bulkSubtopics && bulkSubtopics.length > 0) {
        updatedQuestions[questionIndex].subtopics = bulkSubtopics;
      }
      
      if (bulkLevel) {
        updatedQuestions[questionIndex].level = bulkLevel;
      }
    });
    
    setQuestions(updatedQuestions);
    toast.success(`Updated ${selectedQuestions.length} questions`);
  };

  // Handle bulk standard change
  const handleBulkStandardChange = (value) => {
    setBulkStandard(value);
    setBulkSubject(null);
    setBulkChapter([]);
    setBulkTopics([]);
    setBulkSubtopics([]);
    
    dispatch(getSubjects(value));
  };

  // Handle bulk subject change
  const handleBulkSubjectChange = (value) => {
    setBulkSubject(value);
    setBulkChapter([]);
    setBulkTopics([]);
    setBulkSubtopics([]);
    
    if (bulkStandard) {
      dispatch(getChapters(value, bulkStandard));
    }
  };

  // Handle bulk chapter change
  const handleBulkChapterChange = (values, options) => {
    const selectedChapters = options.map(option => ({
      _id: option.value,
      name: option.label,
    }));
    
    setBulkChapter(selectedChapters);
    setBulkTopics([]);
    setBulkSubtopics([]);
    
    if (selectedChapters.length > 0 && bulkSubject && bulkStandard) {
      const chapterIds = selectedChapters.map(chap => chap._id).join(',');
      dispatch(getTopics(bulkSubject, bulkStandard, chapterIds));
    }
  };

  // Handle bulk topic change
  const handleBulkTopicChange = (values, options) => {
    const selectedTopics = options.map(option => ({
      _id: option.value,
      name: option.label,
    }));
    
    setBulkTopics(selectedTopics);
    setBulkSubtopics([]);
    
    if (selectedTopics.length > 0 && bulkSubject && bulkStandard && bulkChapter.length > 0) {
      const chapterIds = bulkChapter.map(chap => chap._id).join(',');
      const topicIds = selectedTopics.map(topic => topic._id).join(',');
      dispatch(getSubtopics(bulkSubject, bulkStandard, chapterIds, topicIds));
    }
  };

  // Handle bulk subtopic change
  const handleBulkSubtopicChange = (values, options) => {
    const selectedSubtopics = options.map(option => ({
      _id: option.value,
      name: option.label,
    }));
    
    setBulkSubtopics(selectedSubtopics);
  };

  // Handle batch submission
  // ... existing code ...

  // Upload image to S3 using pre-signed URL
  const uploadImageToS3 = async (file, signedUrl) => {
    try {
      const response = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!response.ok) {
        toast.error(`Image upload failed: ${file.name}`);
        throw new Error("Failed to upload image to S3");
      }
      
      return true;
    } catch (error) {
      console.error("Error uploading to S3:", error);
      return false;
    }
  };

  const handleBatchSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Get selected questions or current page questions if none selected
      const startIndex = (currentPage - 1) * questionsPerPage;
      const endIndex = Math.min(startIndex + questionsPerPage, questions.length);
      const selectedQuestionsData = selectedQuestions.length > 0 
        ? selectedQuestions.map(idx => questions[idx])
        : questions.slice(startIndex, endIndex);
      
      if (selectedQuestionsData.length === 0) {
        toast.error("No questions selected for submission");
        setIsSubmitting(false);
        return;
      }
      
      // Validate questions before submission
      const invalidQuestions = selectedQuestionsData.filter(q => 
        !q.standard || !q.subject || !q.level || !q.questionText
      );
      
      if (invalidQuestions.length > 0) {
        toast.error(`${invalidQuestions.length} questions are missing required fields`);
        setIsSubmitting(false);
        return;
      }
      
      // Step 1: Generate pre-signed URLs
      const preUploadResponse = await axios.post(`${server}/api/questions/preupload`, {
        questions: selectedQuestionsData.map(q => ({
          question: q.questionText,
          standard: q.standard,
          subject: q.subject,
          chapter: q.chapter || [],
          topics: q.topics || [],
          subtopics: q.subtopics || [],
          level: q.level,
          options: q.options.map(opt => ({
            name: opt,
            isCorrect: q.correctAnswer === opt,
            image: []
          })),
          images: q.image ? [{ 
            name: `question_${Date.now()}.jpg`, 
            type: 'image/jpeg' 
          }] : []
        }))
      }, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true
      });
      
      if (!preUploadResponse.data.success) {
        toast.error(preUploadResponse.data.message || "Failed to prepare questions");
        setIsSubmitting(false);
        return;
      }
      
      // Step 2: Upload images to S3 using pre-signed URLs
      const { preparedQuestions } = preUploadResponse.data;
      const uploadPromises = [];
      const questionsWithImageUrls = [];
      
      for (const preparedQuestion of preparedQuestions) {
        if (!preparedQuestion.success) continue;
        
        // Create a copy of the question data to add image URLs
        const questionWithUrls = { ...preparedQuestion.questionData };
        
        // Upload question images and store URLs
        if (preparedQuestion.imageUrls && preparedQuestion.imageUrls.length > 0) {
          const questionIndex = selectedQuestionsData.findIndex(q => 
            q.questionText === preparedQuestion.questionData.question
          );
          
          if (questionIndex !== -1 && selectedQuestionsData[questionIndex].image) {
            // Convert base64 to blob for upload
            const base64Response = await fetch(selectedQuestionsData[questionIndex].image);
            const imageBlob = await base64Response.blob();
            
            // Add the upload promise
            uploadPromises.push(
              uploadImageToS3(imageBlob, preparedQuestion.imageUrls[0].putUrl)
            );
            
            // Store the image URLs in the question data for finalization
            questionWithUrls.images = [{
              name: preparedQuestion.imageUrls[0].name,
              url: preparedQuestion.imageUrls[0].getUrl,
              putUrl: preparedQuestion.imageUrls[0].putUrl,
              key: preparedQuestion.imageUrls[0].key
            }];
          }
        }
        
        questionsWithImageUrls.push(questionWithUrls);
      }
      
      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
      
      // Step 3: Finalize questions with image URLs
      const finalizeResponse = await axios.post(`${server}/api/questions/finalize`, {
        questions: questionsWithImageUrls
      }, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true
      });
      
      if (finalizeResponse.data.success) {
        toast.success(`Successfully saved ${finalizeResponse.data.stats?.successfulSaves || 0} questions`);
        
        // Remove saved questions from state
        const savedIndices = preparedQuestions
          .filter(q => q.success)
          .map(q => q.index);
        
        const remainingQuestions = questions.filter((_, idx) => 
          !savedIndices.includes(idx)
        );
        
        // Update questions state
        setQuestions(remainingQuestions);
        
        // Remove from localStorage
        localStorage.setItem('extractedQuestions', JSON.stringify(remainingQuestions));
        
        // Adjust current page if necessary
        if (remainingQuestions.length <= (currentPage - 1) * questionsPerPage) {
          setCurrentPage(prev => Math.max(1, prev - 1));
        }
      } else {
        toast.error(finalizeResponse.data.message || "Failed to save questions");
      }
    } catch (error) {
      console.error("Error submitting questions:", error);
      toast.error(error.response?.data?.message || "Failed to submit questions");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalQuestions / questionsPerPage)) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Extracted Questions 
          <span className="text-sm font-normal ml-2">
            (Total Ques- {totalQuestions})
          </span>
        </h2>
        
      </div>

      {/* Bulk metadata section */}
      <div className="mb-6 p-4 border-2 border-blue-300 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Bulk Edit Selected Questions</h3>
          <div className="flex items-center gap-2">
            <Checkbox 
              onChange={(e) => handleSelectAllQuestions(e.target.checked)}
              checked={getCurrentQuestions().every((_, idx) => 
                selectedQuestions.includes(idx + (currentPage - 1) * questionsPerPage)
              )}
              className="text-white"
            >
              Select All on This Page
            </Checkbox>
            <Button 
              icon={<FaUndo />} 
              onClick={() => {
                setBulkStandard(null);
                setBulkSubject(null);
                setBulkChapter([]);
                setBulkTopics([]);
                setBulkSubtopics([]);
                setBulkLevel(null);
              }}
              title="Reset all bulk fields"
              danger
              size="small"
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          {/* Standard Dropdown */}
          <div className="flex flex-col">
            <label className="text-white-500 text-sm mb-1">Standard</label>
            <Select
              showSearch
              style={{ width: 150 }}
              placeholder="Standard"
              optionFilterProp="children"
              onChange={handleBulkStandardChange}
              value={bulkStandard}
              options={standards}
            />
          </div>
          
          {/* Subject Dropdown */}
          <div className="flex flex-col">
            <label className="text-white-500 text-sm mb-1">Subject</label>
            <Select
              showSearch
              style={{ width: 150 }}
              placeholder="Subject"
              optionFilterProp="children"
              onChange={handleBulkSubjectChange}
              value={bulkSubject}
              options={subjectList?.map((name) => ({
                value: name,
                label: name,
              }))}
            />
          </div>
          
          {/* Chapter Dropdown */}
          <div className="flex flex-col">
            <label className="text-white-500 text-sm mb-1">Chapter</label>
            <Select
              mode="multiple"
              showSearch
              style={{ width: 150 }}
              placeholder="Chapter"
              optionFilterProp="children"
              onChange={(values, options) => handleBulkChapterChange(values, options)}
              value={bulkChapter.map(el => el._id)}
              options={chapterList?.map(chapter => ({
                value: chapter._id,
                label: chapter.name,
              }))}
              labelInValue
            />
          </div>
          
          {/* Topic Dropdown */}
          <div className="flex flex-col">
            <label className="text-white-500 text-sm mb-1">Topic</label>
            <Select
              mode="multiple"
              showSearch
              style={{ width: 150 }}
              placeholder="Topic"
              optionFilterProp="children"
              onChange={(values, options) => handleBulkTopicChange(values, options)}
              value={bulkTopics.map(el => el._id)}
              options={topicList?.map(el => ({
                value: el._id,
                label: el.name,
              }))}
              labelInValue
            />
          </div>
          
          {/* Subtopic Dropdown */}
          <div className="flex flex-col">
            <label className="text-white-500 text-sm mb-1">Subtopic</label>
            <Select
              mode="multiple"
              showSearch
              style={{ width: 150 }}
              placeholder="Subtopic"
              optionFilterProp="children"
              onChange={(values, options) => handleBulkSubtopicChange(values, options)}
              value={bulkSubtopics.map(el => el._id)}
              options={subtopics?.map(subtopic => ({
                value: subtopic._id,
                label: subtopic.name,
              }))}
              labelInValue
            />
          </div>
          
          {/* Level Dropdown */}
          <div className="flex flex-col">
            <label className="text-white-500 text-sm mb-1">Level</label>
            <Select
              showSearch
              style={{ width: 150 }}
              placeholder="Level"
              optionFilterProp="children"
              onChange={(value) => setBulkLevel(value)}
              value={bulkLevel}
              options={[
                { value: "boards", label: "Boards" },
                { value: "neet", label: "Neet" },
                { value: "jeemains_easy", label: "JeeMains_Easy" },
                { value: "jeemains", label: "JeeMains" },
                { value: "jeeadvance", label: "JeeAdvance" },
              ]}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={applyBulkMetadata}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg"
          >
            Apply to Selected ({selectedQuestions.length})
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {getCurrentQuestions().map((question, index) => {
          const actualIndex = index + (currentPage - 1) * questionsPerPage;
          const isSelected = selectedQuestions.includes(actualIndex);
          
          return (
            <div 
              key={index} 
              className={`p-4 border-2 ${isSelected ? 'border-green-400' : 'border-red-300'} rounded-xl relative`}
              onDrop={(e) => handleDrop(e, actualIndex)}
              onDragOver={handleDragOver}
            >
              <div className="mb-2 flex justify-between items-center">
                <div className="flex items-center flex-1">
                  <Checkbox 
                    checked={isSelected}
                    onChange={(e) => handleSelectQuestion(index, e.target.checked)}
                    className="mr-2"
                  />
                  <div>
                    <span className="font-bold">Q-{question.questionNumber}</span>{" "}
                    <span dangerouslySetInnerHTML={{ __html: question.questionText }}></span>
                  </div>
                </div>
                
                {/* Image preview and reset button */}
                <div className="flex items-center gap-2">
                  <Button 
                    icon={<FaUndo />} 
                    onClick={() => {
                      const updatedQuestions = [...questions];
                      updatedQuestions[actualIndex] = {
                        ...updatedQuestions[actualIndex],
                        standard: null,
                        subject: null,
                        chapter: [],
                        topics: [],
                        subtopics: [],
                        level: null
                      };
                      setQuestions(updatedQuestions);
                    }}
                    title="Reset metadata"
                    danger
                    size="small"
                  >
                    Reset
                  </Button>
                  
                  <div className="relative ml-2">
                    {question.image ? (
                      <div className="relative">
                        <div className="w-12 h-12 border border-gray-300 rounded-lg overflow-hidden">
                          <img 
                            src={question.image} 
                            alt="Question" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button 
                          onClick={() => removeImage(actualIndex)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-700 w-5 h-5 flex items-center justify-center"
                          title="Remove Image"
                        >
                          <FaTrash size={10} />
                        </button>
                      </div>
                    ) : (
                      <label 
                        htmlFor={`image-upload-${index}`}
                        className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                        title="Drop image here"
                      >
                        <FaImage className="text-gray-400" />
                        <input
                          type="file"
                          id={`image-upload-${index}`}
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleImageUpload(e.target.files[0], actualIndex);
                            }
                            e.target.value = null;
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Metadata fields */}
              <div className="flex flex-wrap gap-4 my-4">
                {/* Standard Dropdown */}
                <div className="flex flex-col">
                  <label className="text-white-500 text-sm mb-1">Standard</label>
                  <Select
                    showSearch
                    style={{ width: 150 }}
                    placeholder="Standard"
                    optionFilterProp="children"
                    onChange={(value) => handleStandardChange(value, actualIndex)}
                    value={question.standard}
                    options={standards}
                  />
                </div>
                
                {/* Subject Dropdown */}
                <div className="flex flex-col">
                  <label className="text-white-500 text-sm mb-1">Subject</label>
                  <Select
                    showSearch
                    style={{ width: 150 }}
                    placeholder="Subject"
                    optionFilterProp="children"
                    onChange={(value) => handleSubjectChange(value, actualIndex)}
                    value={question.subject}
                    options={subjectList?.map((name) => ({
                      value: name,
                      label: name,
                    }))}
                  />
                </div>
                
                {/* Chapter Dropdown */}
                <div className="flex flex-col">
                  <label className="text-white-500 text-sm mb-1">Chapter</label>
                  <Select
                    mode="multiple"
                    showSearch
                    style={{ width: 150 }}
                    placeholder="Chapter"
                    optionFilterProp="children"
                    onChange={(values, options) => handleChapterChange(values, options, actualIndex)}
                    value={Array.isArray(question.chapter) ? question.chapter.map(el => el._id) : []}
                    options={chapterList?.map(chapter => ({
                      value: chapter._id,
                      label: chapter.name,
                    }))}
                    labelInValue
                  />
                </div>
                
                {/* Topic Dropdown */}
                <div className="flex flex-col">
                  <label className="text-white-500 text-sm mb-1">Topic</label>
                  <Select
                    mode="multiple"
                    showSearch
                    style={{ width: 150 }}
                    placeholder="Topic"
                    optionFilterProp="children"
                    onChange={(values, options) => handleTopicChange(values, options, actualIndex)}
                    value={Array.isArray(question.topics) ? question.topics.map(el => el._id) : []}
                    options={topicList?.map(el => ({
                      value: el._id,
                      label: el.name,
                    }))}
                    labelInValue
                  />
                </div>
                
                {/* Subtopic Dropdown */}
                <div className="flex flex-col">
                  <label className="text-white-500 text-sm mb-1">Subtopic</label>
                  <Select
                    mode="multiple"
                    showSearch
                    style={{ width: 150 }}
                    placeholder="Subtopic"
                    optionFilterProp="children"
                    onChange={(values, options) => handleSubtopicChange(values, options, actualIndex)}
                    value={Array.isArray(question.subtopics) ? question.subtopics.map(el => el._id) : []}
                    options={subtopics?.map(subtopic => ({
                      value: subtopic._id,
                      label: subtopic.name,
                    }))}
                    labelInValue
                  />
                </div>
                
                {/* Level Dropdown */}
                <div className="flex flex-col">
                  <label className="text-white-500 text-sm mb-1">Level</label>
                  <Select
                    showSearch
                    style={{ width: 150 }}
                    placeholder="Level"
                    optionFilterProp="children"
                    onChange={(value) => handleLevelChange(value, actualIndex)}
                    value={question.level}
                    options={[
                      { value: "boards", label: "Boards" },
                      { value: "neet", label: "Neet" },
                      { value: "jeemains_easy", label: "JeeMains_Easy" },
                      { value: "jeemains", label: "JeeMains" },
                      { value: "jeeadvance", label: "JeeAdvance" },
                    ]}
                  />
                </div>
              </div>
              
              {/* Options */}
              {question.options.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center">
                      <div
                        contentEditable
                        dangerouslySetInnerHTML={{ __html: option }}
                        onBlur={(e) => updateOption(actualIndex, optIndex, e.target.innerHTML)}
                        className="block py-2 px-3 w-full bg-black text-sm border border-gray-300 rounded-lg mr-2"
                      />
                      <input
                        type="radio"
                        name={`question-${index}`}
                        checked={question.correctAnswer === option}
                        onChange={() => setCorrectAnswer(actualIndex, option)}
                        className="h-4 w-4"
                      />
                      <button
                        onClick={() => {
                          const updatedQuestions = [...questions];
                          updatedQuestions[actualIndex].options.splice(optIndex, 1);
                          // If we removed the correct answer, reset it
                          if (updatedQuestions[actualIndex].correctAnswer === option) {
                            updatedQuestions[actualIndex].correctAnswer = null;
                          }
                          setQuestions(updatedQuestions);
                        }}
                        className="ml-2 text-red-500 hover:text-red-700"
                        title="Remove option"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                  
                  {/* Add option button */}
                  <div className="col-span-2 mt-2 flex justify-between">
                    <button
                      onClick={() => {
                        const updatedQuestions = [...questions];
                        updatedQuestions[actualIndex].options.push("");
                        setQuestions(updatedQuestions);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg text-sm"
                    >
                      + Add Option
                    </button>
                    {question.options.length > 0 && (
                      <button
                        onClick={() => {
                          const updatedQuestions = [...questions];
                          updatedQuestions[actualIndex].options = [];
                          updatedQuestions[actualIndex].correctAnswer = null;
                          setQuestions(updatedQuestions);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg text-sm"
                      >
                        Remove All Options
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <div className="italic text-gray-500 mb-2">
                    No multiple choice options for this question
                  </div>
                  <button
                    onClick={() => {
                      const updatedQuestions = [...questions];
                      updatedQuestions[actualIndex].options = ["", "", "", ""];
                      setQuestions(updatedQuestions);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg text-sm"
                  >
                    Add Multiple Choice Options
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
    

      <div className="flex justify-between mt-6 fixed bottom-0 shadow-slate-300 shadow-inner rounded-xl bg-[#131a1b] p-4 w-full max-w-2xl ">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg ${
              currentPage === 1
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <FaArrowLeft />
          </button>
          <div className="flex items-center ">
          <button
          onClick={handleBatchSubmit}
          disabled={isSubmitting}
          className={`${
            isSubmitting 
              ? 'bg-purple-400 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700'
          } text-white py-2 px-6 rounded-lg flex items-center gap-2`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
        <span className="text-sm font-normal ml-2">
        (Page {currentPage} of {Math.ceil(totalQuestions / questionsPerPage)})
        </span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === Math.ceil(totalQuestions / questionsPerPage)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === Math.ceil(totalQuestions / questionsPerPage)
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <FaArrowRight />
          </button>
      
      </div>
    </div>
  );
};

export default ExtractedQuestions;