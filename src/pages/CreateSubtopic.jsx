import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Select } from 'antd';
import toast from 'react-hot-toast';
import { createSubtopic } from '../actions/subtopicAction';
import { getSubjects } from '../actions/subjectAction';
import { getChapters } from '../actions/chapterAction';
import { getTopics } from '../actions/topicAction';
import { standards } from '../components/Options';
import PropTypes from 'prop-types';

const CreateSubtopic = () => {
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.subtopic);
    const { subjectList } = useSelector((state) => state.getSubject);
    const { chapterList } = useSelector((state) => state.getChapter);
    const { topicList } = useSelector((state) => state.getTopic);

    const [standard, setStandard] = useState('');
    const [subject, setSubject] = useState('');
    const [chapter, setChapter] = useState('');
    const [topic, setTopic] = useState('');
    const [subtopics, setSubtopics] = useState([{ name: '', subtopics: [] }]);

    const inputRef = useRef(null);

    useEffect(() => {
        if (standard) {
            dispatch(getSubjects(standard));
        }
        if (subject && standard) {
            dispatch(getChapters(subject, standard));
        }
        if (subject && standard && chapter) {
            dispatch(getTopics(subject, standard, chapter));
        }
    }, [standard, subject, chapter, dispatch]);

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        const formattedData = {
            subjectName: subject,
            standard: standard,
            chapterName: chapter,
            topicName: topic,
            subtopics,
        };

        try {
            const result = await dispatch(createSubtopic(formattedData));

            if (result && result.success) {
                toast.success('Subtopic added successfully!');
                setSubtopics([{ name: '', subtopics: [] }]);
            } else {
                const errorMessage = result?.message || 'Failed to add subtopic. Please try again.';
                toast.error(errorMessage);
            }
        } catch (error) {
            toast.error(error.message || 'Subtopic already exist!');
        }
    };

    const handleSubtopicChange = (index, key, value) => {
      const updatedSubtopics = [...subtopics];
      const keys = key.split('.');
  
      let target = updatedSubtopics[index];
      for (let i = 0; i < keys.length - 1; i++) {
          target = target[keys[i]];
      }
      target[keys[keys.length - 1]] = value;
  
      setSubtopics(updatedSubtopics);
  
      if (inputRef.current) {
          setTimeout(() => {
              inputRef.current.focus();
          }, 0);
      }
  };
  

    const addSubtopic = () => {
        setSubtopics((prev) => [...prev, { name: '', subtopics: [] }]);
    };

    const addNestedSubtopic = (index) => {
        const updatedSubtopics = [...subtopics];
        const targetSubtopic = updatedSubtopics[index];
        targetSubtopic.subtopics.push({ name: '', subtopics: [] });
        setSubtopics(updatedSubtopics);
    };

    const SubtopicInput = ({ subtopic, index, onChange, onAddNested }) => (
        <div className="relative z-0 w-full mb-5 group" key={index}>
            <input
                type="text"
                ref={inputRef} 
                name={`subtopic-${index}`}
                id={`subtopic-${index}`}
                className="block py-2.5 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-white-300 appearance-none dark:text-white dark:border-white-600 dark:focus:border-white-500 focus:outline-none focus:ring-0 focus:border-white-600 peer"
                placeholder="Subtopic Name"
                value={subtopic.name}
                onChange={(e) => onChange(index, 'name', e.target.value)}
                required
            />
            <button className='mt-8 p-4 border mb-10 rounded-xl h-10 text-sm flex items-center justify-center cursor-pointer' type="button" onClick={() => onAddNested(index)}>
                Add Nested Subtopic
            </button>
            {subtopic.subtopics.map((nestedSubtopic, nestedIndex) => (
                <div key={nestedIndex} style={{ marginLeft: '20px' }}>
                    <SubtopicInput
                        subtopic={nestedSubtopic}
                        index={nestedIndex}
                        onChange={(idx, key, value) => onChange(index, `subtopics.${idx}.${key}`, value)}
                        onAddNested={() => onAddNested(index)}
                    />
                </div>
            ))}
        </div>
    );

    SubtopicInput.propTypes = {
        subtopic: PropTypes.shape({
            name: PropTypes.string.isRequired,
            subtopics: PropTypes.arrayOf(
                PropTypes.shape({
                    name: PropTypes.string.isRequired,
                    subtopics: PropTypes.arrayOf(
                        PropTypes.object
                    ),
                })
            ).isRequired,
        }).isRequired,
        index: PropTypes.number.isRequired,
        onChange: PropTypes.func.isRequired,
        onAddNested: PropTypes.func.isRequired,
    };

    return (
        <main className="p-4">
            <h1 className="text-center m-10 text-white-600">Create Subtopics</h1>
            <form className="max-w-md mx-auto" onSubmit={handleFormSubmit}>
            <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select Standard"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? "").includes(input)
            }
            onChange={(value) => {
              setStandard(value);
              // getSubject(value);
            }}
            options={standards}
          />

          <label className=" text-white-500 text-sm dark:text-white-400 ">
            Standard
          </label>
        </div>

        <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select Subject"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            filterSort={(optionA, optionB) =>
              optionA.label
                .toLowerCase()
                .localeCompare(optionB.label.toLowerCase())
            }
            onChange={(value) => {
              setSubject(value);
              getChapters(value);
            }}
            value={subject}
            options={
              subjectList &&
              subjectList.map((name, index) => ({
                value: name,
                label: name,
                key: index,
              }))
            }
            required
          />

          <label
            htmlFor="subject"
            className=" text-white-500 text-sm dark:text-white-400 "
          >
            Subject
          </label>
        </div>
        <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select Chapter"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            filterSort={(optionA, optionB) =>
              optionA.label
                .toLowerCase()
                .localeCompare(optionB.label.toLowerCase())
            }
            onChange={(value) => {
              setChapter(value);
              getTopics(value);
            }}
            value={chapter}
            options={
              chapterList &&
              chapterList.map((chapter) => ({
                value: chapter.name,
                label: chapter.name,
                key: chapter._id,
              }))
            }
          />

          <label
            htmlFor="chapter"
            className=" text-white-500 text-sm dark:text-white-400 "
          >
            Chapter
          </label>
        </div>
        <div className="relative z-0 w-full mb-5 group flex flex-col-reverse">
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select Topic"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            filterSort={(optionA, optionB) =>
              optionA.label
                .toLowerCase()
                .localeCompare(optionB.label.toLowerCase())
            }
            onChange={(value) => {
              setTopic(value);
              // getSubtopics(value);
            }}
            value={topic}
            options={
              topicList &&
              topicList?.map((el) => ({ value: el.name, label: el.name }))
            }
            required
          />
          <label className=" text-white-500 text-sm dark:text-white-400 ">
            Topic
          </label>
        </div>
                {/* Subtopics inputs */}
                {subtopics.map((subtopic, index) => (
                   <SubtopicInput
                   key={index}
                   subtopic={subtopic}
                   index={index}
                   onChange={handleSubtopicChange}
                   onAddNested={addNestedSubtopic}
               />
                ))}

                <div
                    className="border mb-10 rounded-xl h-10 text-sm flex items-center justify-center cursor-pointer"
                    onClick={addSubtopic}
                >
                    Add More Subtopics
                </div>

                {isLoading ? (
                    <button
                        type="submit"
                        disabled
                        className="text-white bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        Submit
                    </button>
                ) : (
                    <button
                        type="submit"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-white-800"
                    >
                        Submit
                    </button>
                )}

            </form>
        </main>
    );
};


export default CreateSubtopic;
