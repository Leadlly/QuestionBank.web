import { useState, useEffect } from "react";
import { Select } from "antd";
import { FaPlus, FaUpload, FaArrowLeft } from "react-icons/fa";
import { standards } from "../components/Options";
import { useDispatch, useSelector } from "react-redux";
import { getSubjects } from "../actions/subjectAction";
import { getChapters } from "../actions/chapterAction";
import { getTopics } from "../actions/topicAction";
import toast from "react-hot-toast";
import axios from "axios";
import { server } from "../main";
import ExtractedQuestions from "../components/ExtractedQuestions";

const UploadPdf = () => {
  const dispatch = useDispatch();
  const [standard, setStandard] = useState(null);
  const [subject, setSubject] = useState(null);
  const [chapter, setChapter] = useState([]);  // Changed to array
  const [topic, setTopic] = useState([]);      // Changed to array
  const [file, setFile] = useState(null);
  const [extractedQuestions, setExtractedQuestions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(true);
  
  const { subjectList } = useSelector((state) => state.getSubject);
  const { chapterList } = useSelector((state) => state.getChapter);
  const { topicList } = useSelector((state) => state.getTopic);

  // Load questions from localStorage on component mount
  useEffect(() => {
    const savedQuestions = localStorage.getItem('extractedQuestions');
    if (savedQuestions) {
      try {
        const parsedQuestions = JSON.parse(savedQuestions);
        setExtractedQuestions(parsedQuestions);
        if (parsedQuestions.length > 0) {
          setShowUploadForm(false);
        }
      } catch (error) {
        console.error("Error parsing saved questions:", error);
      }
    }
  }, []);

  // Save questions to localStorage whenever they change
  useEffect(() => {
    if (extractedQuestions.length > 0) {
      localStorage.setItem('extractedQuestions', JSON.stringify(extractedQuestions));
    }
  }, [extractedQuestions]);

  useEffect(() => {
    if (standard && subject && chapter.length > 0) {
      const chapterIds = chapter.map(chap => chap._id).join(',');
      dispatch(getTopics(subject, standard, chapterIds));
    }
  }, [standard, subject, chapter, dispatch]);

  const handleStandardChange = (value) => {
    setStandard(value);
    dispatch(getSubjects(value));
    setSubject(null);
    setChapter([]);  // Changed from null to empty array
    setTopic([]);    // Changed from null to empty array
  };

  const handleSubjectChange = (value) => {
    setSubject(value);
    if (standard) {
      dispatch(getChapters(value, standard));
    }
    setChapter([]);  // Changed from null to empty array
    setTopic([]);    // Changed from null to empty array
  };

  const handleChapterChange = (values, options) => {
    const selectedChapters = options.map(option => ({
      _id: option.value,
      name: option.label
    }));
    setChapter(selectedChapters);
    setTopic([]);  // Reset topics when chapters change
  };

  const handleTopicChange = (values, options) => {
    const selectedTopics = options.map(option => ({
      _id: option.value,
      name: option.label
    }));
    setTopic(selectedTopics);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === "application/pdf" || selectedFile.type.startsWith("image/"))) {
      setFile(selectedFile);
    } else {
      toast.error("Please select a valid PDF or image file");
      e.target.value = null;
    }
  };

  const extractQuestionsFromPdf = async (fileData) => {
    try {
      setIsProcessing(true);
      
      // Create form data to send the file
      const formData = new FormData();
      formData.append('file', fileData);
      
      // Use the specified server endpoint
      const response = await axios.post(
        `${server}/api/extract-questions`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      // Parse the response according to the specified format
      if (response.data.success && Array.isArray(response.data.data)) {
        const extractedData = response.data.data.map((item, index) => ({
          questionNumber: (index + 1).toString(),
          questionText: item.question,
          options: item.options || [],
          correctAnswer: item.correctAnswer || null
        }));
        
        setExtractedQuestions(extractedData);
        setShowUploadForm(false); // Hide upload form and show questions
        toast.success(`Successfully extracted ${extractedData.length} questions`);
      } else {
        toast.error("Invalid response format from the server");
      }
    } catch (error) {
      console.error("Error extracting questions:", error);
      toast.error("Failed to extract questions from the file");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a PDF or image file to upload");
      return;
    }

    // if (!standard) {
    //   toast.error("Please select a Standard before extracting questions");
    //   return;
    // }

    // if (!subject) {
    //   toast.error("Please select a Subject before extracting questions");
    //   return;
    // }

    // Extract questions from the PDF
    await extractQuestionsFromPdf(file);
  };
  
  const handleBackToUpload = () => {
    setShowUploadForm(true);
  };

  return (
    <main className="p-4 flex flex-col items-center">
      <h1 className="text-center m-10 text-white-600">Upload PDF</h1>
      
      {showUploadForm ? (
        // Upload Form UI
        <div className="w-full max-w-2xl p-6 border-2 border-gray-300 rounded-xl">
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center mb-4">
              <FaUpload className="mr-2" />
              <span>Upload PDF</span>
            </div>
            <input
              type="file"
              id="pdf-upload"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="pdf-upload"
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
            >
              Select PDF or Image
            </label>
            {file && (
              <div className="mt-2 text-sm text-gray-400">
                Selected: {file.name}
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            {/* Standard Dropdown */}
            <div className="flex flex-col">
              <label className="text-white-500 text-sm mb-1">Standard</label>
              <Select
                showSearch
                style={{ width: 150 }}
                placeholder="Standard"
                optionFilterProp="children"
                onChange={handleStandardChange}
                value={standard}
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
                onChange={handleSubjectChange}
                value={subject}
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
                onChange={(values, options) => handleChapterChange(values, options)}
                value={chapter?.map(chap => chap._id) || []}  // Added null check and fallback
                options={chapterList?.map((chapter) => ({
                  value: chapter._id,
                  label: chapter.name,
                }))}  // Added fallback for chapterList
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
                onChange={(values, options) => handleTopicChange(values, options)}
                value={topic?.map(t => t._id) || []}  // Added null check and fallback
                options={topicList?.map((topic) => ({
                  value: topic._id,
                  label: topic.name,
                }))}  // Added fallback for topicList
                labelInValue
              />
            </div>
            
            {/* Add Button */}
            <button className="self-end bg-gray-700 text-white p-2 rounded-full h-10 w-10 flex items-center justify-center">
              <FaPlus />
            </button>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleUpload}
              disabled={isProcessing}
              className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? 'Processing...' : 'Extract Questions'}
            </button>
          </div>
        </div>
      ) : (
        // Questions Display UI
        <div className="w-full max-w-2xl">
          <div className="mb-4">
            <button 
              onClick={handleBackToUpload}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <FaArrowLeft className="mr-2" /> Back to Upload
            </button>
          </div>
          
          <ExtractedQuestions 
            questions={extractedQuestions} 
            setQuestions={setExtractedQuestions}
            setFile={setFile}
            selectedStandard={standard}
            selectedSubject={subject}
            selectedChapter={chapter}
            selectedTopic={topic}
          />
        </div>
      )}
    </main>
  );
};

export default UploadPdf;