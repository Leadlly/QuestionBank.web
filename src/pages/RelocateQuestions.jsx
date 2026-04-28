import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { Select } from "antd";
import { FiArrowRight, FiCheckSquare, FiSquare, FiLoader, FiZap } from "react-icons/fi";
import { getSubjects } from "../actions/subjectAction";
import { getChapters } from "../actions/chapterAction";
import { getTopics } from "../actions/topicAction";
import { getSubtopics } from "../actions/subtopicAction";
import { relocateQuestions } from "../actions/questionAction";
import { server } from "../main";

const STANDARDS = [11, 12];

const SelectorPanel = ({
  title,
  color,
  standard,
  setStandard,
  subject,
  setSubject,
  chapter,
  setChapter,
  topic,
  setTopic,
  subtopic,
  setSubtopic,
  subjects,
  chapters,
  topics,
  subtopics,
  subjectsLoading,
  chaptersLoading,
  topicsLoading,
  subtopicsLoading,
}) => (
  <div className={`flex flex-col gap-4 bg-white rounded-2xl border-2 ${color} p-6 shadow-sm`}>
    <h2 className="text-base font-semibold text-gray-700">{title}</h2>

    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">Standard</label>
      <Select
        className="w-full"
        placeholder="Select standard"
        value={standard || undefined}
        onChange={(val) => {
          setStandard(val);
          setSubject(null);
          setChapter(null);
          setTopic(null);
          setSubtopic(null);
        }}
        options={STANDARDS.map((s) => ({ label: `Class ${s}`, value: s }))}
      />
    </div>

    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
      <Select
        className="w-full"
        placeholder={!standard ? "Select standard first" : "Select subject"}
        value={subject || undefined}
        disabled={!standard || subjectsLoading}
        loading={subjectsLoading}
        onChange={(val) => {
          setSubject(val);
          setChapter(null);
          setTopic(null);
          setSubtopic(null);
        }}
        options={(subjects || []).map((s) => ({ label: typeof s === "string" ? s : s.name, value: typeof s === "string" ? s : s.name }))}
      />
    </div>

    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">Chapter</label>
      <Select
        className="w-full"
        placeholder={!subject ? "Select subject first" : "Select chapter"}
        value={chapter?._id || undefined}
        disabled={!subject || chaptersLoading}
        loading={chaptersLoading}
        onChange={(val) => {
          const found = (chapters || []).find((c) => c._id === val);
          setChapter(found || null);
          setTopic(null);
          setSubtopic(null);
        }}
        options={(chapters || []).map((c) => ({ label: c.name, value: c._id }))}
      />
    </div>

    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">Topic <span className="text-gray-400">(optional)</span></label>
      <Select
        className="w-full"
        placeholder={!chapter ? "Select chapter first" : "Select topic"}
        value={topic?._id || undefined}
        disabled={!chapter || topicsLoading}
        loading={topicsLoading}
        allowClear
        onChange={(val) => {
          const found = (topics || []).find((t) => t._id === val);
          setTopic(found || null);
          setSubtopic(null);
        }}
        options={(topics || []).map((t) => ({ label: t.name, value: t._id }))}
      />
    </div>

    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">Subtopic <span className="text-gray-400">(optional)</span></label>
      <Select
        className="w-full"
        placeholder={!topic ? "Select topic first" : "Select subtopic"}
        value={subtopic?._id || undefined}
        disabled={!topic || subtopicsLoading}
        loading={subtopicsLoading}
        allowClear
        onChange={(val) => {
          const found = (subtopics || []).find((s) => s._id === val);
          setSubtopic(found || null);
        }}
        options={(subtopics || []).map((s) => ({ label: s.name, value: s._id }))}
      />
    </div>
  </div>
);

const RelocateQuestions = () => {
  const dispatch = useDispatch();

  // ── Source selectors ────────────────────────────────────────────────────────
  const [srcStandard, setSrcStandard] = useState(null);
  const [srcSubject, setSrcSubject] = useState(null);
  const [srcChapter, setSrcChapter] = useState(null);
  const [srcTopic, setSrcTopic] = useState(null);
  const [srcSubtopic, setSrcSubtopic] = useState(null);

  // ── Destination selectors ────────────────────────────────────────────────────
  const [dstStandard, setDstStandard] = useState(null);
  const [dstSubject, setDstSubject] = useState(null);
  const [dstChapter, setDstChapter] = useState(null);
  const [dstTopic, setDstTopic] = useState(null);
  const [dstSubtopic, setDstSubtopic] = useState(null);

  // ── Questions list ───────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // ── Selection ────────────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState(new Set());

  // ── AI Agent ─────────────────────────────────────────────────────────────────
  const [agentLoading, setAgentLoading] = useState(false);
  // IDs the agent suggested (used to show the AI badge on rows)
  const [aiSuggestedIds, setAiSuggestedIds] = useState(new Set());

  // ── Relocating ───────────────────────────────────────────────────────────────
  const { isLoading: relocating } = useSelector((state) => state.relocate);

  // ── AI access gate ───────────────────────────────────────────────────────────
  const hasAiAccess = useSelector((state) => !!state.user?.user?.aiAccess);

  // ── Shared dropdown data ─────────────────────────────────────────────────────
  const { subjectList: srcSubjectList, isLoading: srcSubjectsLoading } = useSelector((s) => s.getSubject);
  const { chapterList: srcChapterList, isLoading: srcChaptersLoading } = useSelector((s) => s.getChapter);
  const { topicList: srcTopicList, isLoading: srcTopicsLoading } = useSelector((s) => s.getTopic);
  const { subtopics: srcSubtopicList, isLoading: srcSubtopicsLoading } = useSelector((s) => s.getSubtopic);

  // Destination dropdowns — local state to avoid clobbering the source Redux slices
  const [dstSubjects, setDstSubjects] = useState([]);
  const [dstChapters, setDstChapters] = useState([]);
  const [dstTopics, setDstTopics] = useState([]);
  const [dstSubtopics, setDstSubtopics] = useState([]);
  const [dstSubjectsLoading, setDstSubjectsLoading] = useState(false);
  const [dstChaptersLoading, setDstChaptersLoading] = useState(false);
  const [dstTopicsLoading, setDstTopicsLoading] = useState(false);
  const [dstSubtopicsLoading, setDstSubtopicsLoading] = useState(false);

  const LIMIT = 50;

  // ── Source cascades ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (srcStandard) dispatch(getSubjects(srcStandard));
  }, [srcStandard]);

  useEffect(() => {
    if (srcSubject && srcStandard) dispatch(getChapters(srcSubject, srcStandard));
  }, [srcSubject, srcStandard]);

  useEffect(() => {
    if (srcChapter && srcSubject && srcStandard) dispatch(getTopics(srcSubject, srcStandard, srcChapter._id));
  }, [srcChapter]);

  useEffect(() => {
    if (srcTopic && srcChapter && srcSubject && srcStandard)
      dispatch(getSubtopics(srcSubject, srcStandard, srcChapter._id, srcTopic._id));
  }, [srcTopic]);

  // ── Destination cascades (local fetch to avoid Redux collision) ───────────────
  useEffect(() => {
    if (!dstStandard) return;
    setDstSubjectsLoading(true);
    axios
      .get(`${server}/api/get/subject?standard=${dstStandard}`, { withCredentials: true })
      .then(({ data }) => setDstSubjects(data?.subjectList || []))
      .catch(() => setDstSubjects([]))
      .finally(() => setDstSubjectsLoading(false));
  }, [dstStandard]);

  useEffect(() => {
    if (!dstSubject || !dstStandard) return;
    setDstChaptersLoading(true);
    axios
      .get(`${server}/api/get/chapter?subjectName=${dstSubject}&standard=${dstStandard}`, { withCredentials: true })
      .then(({ data }) => setDstChapters(data?.chapters || []))
      .catch(() => setDstChapters([]))
      .finally(() => setDstChaptersLoading(false));
  }, [dstSubject, dstStandard]);

  useEffect(() => {
    if (!dstChapter || !dstSubject || !dstStandard) return;
    setDstTopicsLoading(true);
    axios
      .get(`${server}/api/get/topic?subjectName=${dstSubject}&standard=${dstStandard}&chapterId=${dstChapter._id}`, { withCredentials: true })
      .then(({ data }) => setDstTopics(data?.topics || []))
      .catch(() => setDstTopics([]))
      .finally(() => setDstTopicsLoading(false));
  }, [dstChapter]);

  useEffect(() => {
    if (!dstTopic || !dstChapter || !dstSubject || !dstStandard) return;
    setDstSubtopicsLoading(true);
    axios
      .get(
        `${server}/api/get/subtopic?subjectName=${dstSubject}&standard=${dstStandard}&chapterId=${dstChapter._id}&topicId=${dstTopic._id}`,
        { withCredentials: true }
      )
      .then(({ data }) => setDstSubtopics(data?.subtopics || []))
      .catch(() => setDstSubtopics([]))
      .finally(() => setDstSubtopicsLoading(false));
  }, [dstTopic]);

  // ── Load questions ────────────────────────────────────────────────────────────
  const loadQuestions = useCallback(
    async (pageNum = 1) => {
      if (!srcChapter) {
        toast.error("Please select at least a source chapter");
        return;
      }
      setListLoading(true);
      setHasLoaded(false);
      setAiSuggestedIds(new Set());
      try {
        const params = {
          standard: srcStandard,
          subject: srcSubject,
          chapterId: srcChapter._id,
          page: pageNum,
          limit: LIMIT,
        };
        if (srcTopic) params.topicId = srcTopic._id;
        if (srcSubtopic) params.subtopics = srcSubtopic.name;

        const { data } = await axios.get(`${server}/api/get/question`, {
          params,
          withCredentials: true,
        });

        setQuestions(data.questions || []);
        setTotalQuestions(data.totalQuestions || 0);
        setPage(pageNum);
        setSelectedIds(new Set());
        setHasLoaded(true);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load questions");
      } finally {
        setListLoading(false);
      }
    },
    [srcStandard, srcSubject, srcChapter, srcTopic, srcSubtopic]
  );

  const totalPages = Math.ceil(totalQuestions / LIMIT);

  // ── Selection helpers ─────────────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected = questions.length > 0 && questions.every((q) => selectedIds.has(q._id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map((q) => q._id)));
    }
  };

  // ── AI Agent: ask which questions to move ─────────────────────────────────────
  const handleAiFilter = async () => {
    if (!dstChapter) {
      toast.error("Please select a destination chapter first");
      return;
    }
    if (questions.length === 0) {
      toast.error("Load questions first");
      return;
    }

    setAgentLoading(true);
    try {
      const payload = {
        questions: questions.map((q) => ({ _id: q._id, question: q.question })),
        source: {
          chapter: srcChapter.name,
          topic: srcTopic?.name || null,
          subtopic: srcSubtopic?.name || null,
        },
        destination: {
          chapter: dstChapter.name,
          topic: dstTopic?.name || null,
          subtopic: dstSubtopic?.name || null,
        },
      };

      const { data } = await axios.post(`${server}/api/agent/filter-relocate`, payload, {
        withCredentials: true,
      });

      const ids = data.questionIds || [];

      if (ids.length === 0) {
        toast("AI found no questions to move to this destination", { icon: "🤖" });
      } else {
        toast.success(`AI selected ${ids.length} question${ids.length !== 1 ? "s" : ""} to move`);
      }

      setAiSuggestedIds(new Set(ids));
      setSelectedIds(new Set(ids));
    } catch (err) {
      toast.error(err.response?.data?.message || "AI filter failed");
    } finally {
      setAgentLoading(false);
    }
  };

  // ── Relocate ─────────────────────────────────────────────────────────────────
  const handleRelocate = async () => {
    if (selectedIds.size === 0) {
      toast.error("No questions selected");
      return;
    }
    if (!dstChapter) {
      toast.error("Please select a destination chapter");
      return;
    }

    const destination = {
      chapter: [dstChapter.name],
      chaptersId: [dstChapter._id],
      topics: dstTopic ? [dstTopic.name] : [],
      topicsId: dstTopic ? [dstTopic._id] : [],
      subtopics: dstSubtopic ? [dstSubtopic.name] : [],
      subtopicsId: dstSubtopic ? [dstSubtopic._id] : [],
    };

    try {
      const result = await dispatch(relocateQuestions([...selectedIds], destination));
      toast.success(result.message || `${selectedIds.size} question(s) relocated`);
      setAiSuggestedIds(new Set());

      // Auto-advance to next page if there are more pages, otherwise reload current
      if (page < totalPages) {
        await loadQuestions(page + 1);
      } else {
        await loadQuestions(page);
      }
    } catch (err) {
      toast.error(err.message || "Relocation failed");
    }
  };

  const srcReady = !!srcChapter;
  const dstReady = !!dstChapter;
  const canAiFilter = hasAiAccess && hasLoaded && questions.length > 0 && dstReady && !agentLoading && !listLoading;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Question Relocation</h1>
          <p className="mt-1 text-sm text-gray-500">
            Move questions from one chapter / topic / subtopic to another in bulk.
          </p>
        </div>

        {/* ── Two-panel selector row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start mb-8">
          <SelectorPanel
            title="Source — where to move FROM"
            color="border-blue-300"
            standard={srcStandard}
            setStandard={setSrcStandard}
            subject={srcSubject}
            setSubject={setSrcSubject}
            chapter={srcChapter}
            setChapter={(c) => { setSrcChapter(c); setHasLoaded(false); setQuestions([]); setSelectedIds(new Set()); setAiSuggestedIds(new Set()); }}
            topic={srcTopic}
            setTopic={(t) => { setSrcTopic(t); setHasLoaded(false); setQuestions([]); setSelectedIds(new Set()); setAiSuggestedIds(new Set()); }}
            subtopic={srcSubtopic}
            setSubtopic={(s) => { setSrcSubtopic(s); setHasLoaded(false); setQuestions([]); setSelectedIds(new Set()); setAiSuggestedIds(new Set()); }}
            subjects={srcSubjectList || []}
            chapters={srcChapterList || []}
            topics={srcTopicList || []}
            subtopics={srcSubtopicList || []}
            subjectsLoading={srcSubjectsLoading}
            chaptersLoading={srcChaptersLoading}
            topicsLoading={srcTopicsLoading}
            subtopicsLoading={srcSubtopicsLoading}
          />

          {/* Arrow */}
          <div className="flex items-center justify-center lg:pt-24">
            <div className="bg-indigo-100 rounded-full p-3">
              <FiArrowRight className="w-6 h-6 text-indigo-600" />
            </div>
          </div>

          <SelectorPanel
            title="Destination — where to move TO"
            color="border-emerald-300"
            standard={dstStandard}
            setStandard={(v) => { setDstStandard(v); setDstSubject(null); setDstChapter(null); setDstTopic(null); setDstSubtopic(null); }}
            subject={dstSubject}
            setSubject={(v) => { setDstSubject(v); setDstChapter(null); setDstTopic(null); setDstSubtopic(null); }}
            chapter={dstChapter}
            setChapter={(c) => { setDstChapter(c); setDstTopic(null); setDstSubtopic(null); }}
            topic={dstTopic}
            setTopic={(t) => { setDstTopic(t); setDstSubtopic(null); }}
            subtopic={dstSubtopic}
            setSubtopic={setDstSubtopic}
            subjects={dstSubjects}
            chapters={dstChapters}
            topics={dstTopics}
            subtopics={dstSubtopics}
            subjectsLoading={dstSubjectsLoading}
            chaptersLoading={dstChaptersLoading}
            topicsLoading={dstTopicsLoading}
            subtopicsLoading={dstSubtopicsLoading}
          />
        </div>

        {/* ── Load Questions + AI Filter bar ── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => loadQuestions(1)}
            disabled={!srcReady || listLoading}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {listLoading ? "Loading…" : "Load Questions"}
          </button>

          {/* AI Filter button — shown once questions are loaded and user has AI access */}
          {hasLoaded && hasAiAccess && (
            <button
              onClick={handleAiFilter}
              disabled={!canAiFilter}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={!dstReady ? "Select a destination chapter first" : "Let AI review questions and auto-select the ones that belong to the destination"}
            >
              {agentLoading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  AI is reviewing…
                </>
              ) : (
                <>
                  <FiZap className="w-4 h-4" />
                  Ask AI to Filter
                </>
              )}
            </button>
          )}

          {hasLoaded && (
            <span className="text-sm text-gray-500">
              {totalQuestions} question{totalQuestions !== 1 ? "s" : ""} found
              {selectedIds.size > 0 && (
                <span className="ml-2 font-medium text-indigo-600">
                  · {selectedIds.size} selected
                  {aiSuggestedIds.size > 0 && (
                    <span className="ml-1 text-violet-600">(AI picked {aiSuggestedIds.size})</span>
                  )}
                </span>
              )}
            </span>
          )}
        </div>

        {/* ── AI hint banner ── */}
        {hasLoaded && hasAiAccess && !dstReady && (
          <div className="mb-4 flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-sm text-violet-700">
            <FiZap className="w-4 h-4 flex-shrink-0" />
            <span>Select a <strong>destination</strong> chapter to unlock AI filtering.</span>
          </div>
        )}

        {/* ── Question list ── */}
        {hasLoaded && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            {/* List header */}
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
              >
                {allSelected ? (
                  <FiCheckSquare className="w-4 h-4 text-indigo-600" />
                ) : (
                  <FiSquare className="w-4 h-4" />
                )}
                {allSelected ? "Deselect All" : "Select All"}
              </button>
              <span className="text-xs text-gray-400">
                Page {page} of {totalPages || 1}
              </span>
            </div>

            {/* Rows */}
            {questions.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm">No questions found for this filter.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {questions.map((q, idx) => {
                  const checked = selectedIds.has(q._id);
                  const aiPicked = aiSuggestedIds.has(q._id);
                  return (
                    <li
                      key={q._id}
                      onClick={() => toggleSelect(q._id)}
                      className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors ${
                        checked
                          ? aiPicked
                            ? "bg-violet-50"
                            : "bg-indigo-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {checked ? (
                          <FiCheckSquare className={`w-4 h-4 ${aiPicked ? "text-violet-600" : "text-indigo-600"}`} />
                        ) : (
                          <FiSquare className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <span className="text-xs text-gray-400 w-7 flex-shrink-0 mt-0.5 font-mono">
                        {(page - 1) * LIMIT + idx + 1}.
                      </span>
                      <span
                        className="text-sm text-gray-800 leading-relaxed flex-1"
                        dangerouslySetInnerHTML={{ __html: q.question }}
                      />
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {aiPicked && (
                          <span className="flex items-center gap-0.5 text-xs bg-violet-100 text-violet-700 rounded px-1.5 py-0.5 font-medium">
                            <FiZap className="w-3 h-3" /> AI
                          </span>
                        )}
                        {q.images && q.images.length > 0 && (
                          <span className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">
                            {q.images.length} img
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => loadQuestions(page - 1)}
                  disabled={page <= 1 || listLoading}
                  className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                <span className="text-sm text-gray-500">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => loadQuestions(page + 1)}
                  disabled={page >= totalPages || listLoading}
                  className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Relocate action bar ── */}
        {hasLoaded && (
          <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4">
            <div className="text-sm text-gray-600">
              {selectedIds.size === 0 ? (
                <span className="text-gray-400">Select questions to relocate</span>
              ) : (
                <>
                  <span className="font-semibold text-indigo-700">{selectedIds.size}</span> question{selectedIds.size !== 1 ? "s" : ""} selected
                  {dstChapter && (
                    <span className="ml-1 text-gray-500">
                      → <span className="font-medium text-emerald-700">{dstChapter.name}</span>
                      {dstTopic && <span> / {dstTopic.name}</span>}
                      {dstSubtopic && <span> / {dstSubtopic.name}</span>}
                    </span>
                  )}
                </>
              )}
            </div>

            <button
              onClick={handleRelocate}
              disabled={selectedIds.size === 0 || !dstReady || relocating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {relocating ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Relocating…
                </>
              ) : (
                <>
                  <FiArrowRight className="w-4 h-4" />
                  Relocate Selected
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelocateQuestions;
