import { useEffect, useState } from "react";
import { CheckCircle2, ListChecks, Plus, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { getCourseStructure } from "../api/adminCoursesApi.js";
import { createAdminQuestion, createAdminTest, deleteAdminQuestion, deleteAdminTest, getAdminTests, getTestById, setAdminTestPublished } from "../api/testsApi.js";
import { getApiErrorMessage } from "../api/client.js";
import PageLoader from "../components/common/PageLoader.jsx";

const emptyTest = { title: "", type: "LESSON", targetId: "", passScorePercent: 60, timeLimitMinutes: 1 };
const emptyQuestion = { questionText: "", options: ["", "", "", ""], correctIndex: 0 };

function AdminTestsPage() {
  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [testForm, setTestForm] = useState(emptyTest);
  const [questionForm, setQuestionForm] = useState(emptyQuestion);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setIsLoading(true);
    try {
      const [testData, courseData] = await Promise.all([getAdminTests(), getCourseStructure()]);
      setTests(Array.isArray(testData) ? testData : []);
      setCourses(Array.isArray(courseData) ? courseData : courseData?.courses || []);
    } catch (requestError) { setError(getApiErrorMessage(requestError)); }
    finally { setIsLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const lessons = courses.flatMap((course) => (course.modules || []).flatMap((module) =>
    (module.lessons || []).map((lesson) => ({ ...lesson, courseTitle: course.title, moduleTitle: module.title })),
  ));

  async function selectTest(id) {
    setError("");
    try { setSelected(await getTestById(id)); } catch (requestError) { setError(getApiErrorMessage(requestError)); }
  }

  async function submitTest(event) {
    event.preventDefault(); setError(""); setMessage("");
    try {
      const isFinal = testForm.type === "FINAL";
      const created = await createAdminTest({ title: testForm.title, type: testForm.type,
        [isFinal ? "courseId" : "lessonId"]: Number(testForm.targetId),
        passScorePercent: Number(testForm.passScorePercent),
        timeLimitMinutes: testForm.timeLimitMinutes ? Number(testForm.timeLimitMinutes) : null });
      setTestForm(emptyTest); setMessage("Test yaradıldı."); await load(); await selectTest(created.id);
    } catch (requestError) { setError(getApiErrorMessage(requestError)); }
  }

  async function submitQuestion(event) {
    event.preventDefault(); if (!selected) return;
    setError(""); setMessage("");
    try {
      const options = questionForm.options.map((item) => item.trim()).filter(Boolean);
      const correctValue = questionForm.options[questionForm.correctIndex].trim();
      if (!correctValue || !options.includes(correctValue)) throw new Error("Düzgün cavab boş ola bilməz.");
      await createAdminQuestion(selected.id, { questionText: questionForm.questionText, options, correctValue, order: selected.questions.length + 1 });
      setQuestionForm(emptyQuestion); setMessage("Sual əlavə edildi."); await selectTest(selected.id); await load();
    } catch (requestError) { setError(getApiErrorMessage(requestError)); }
  }

  async function togglePublished(test) {
    setError("");
    try { await setAdminTestPublished(test.id, !test.published); await load(); await selectTest(test.id); }
    catch (requestError) { setError(getApiErrorMessage(requestError)); }
  }

  async function removeTest(id) {
    if (!window.confirm("Test silinsin?")) return;
    try { await deleteAdminTest(id); if (selected?.id === id) setSelected(null); await load(); }
    catch (requestError) { setError(getApiErrorMessage(requestError)); }
  }

  async function removeQuestion(id) {
    if (!window.confirm("Sual silinsin?")) return;
    try { await deleteAdminQuestion(id); await selectTest(selected.id); await load(); }
    catch (requestError) { setError(getApiErrorMessage(requestError)); }
  }

  if (isLoading) return <PageLoader message="Testlər yüklənir..." />;
  const targetOptions = testForm.type === "FINAL" ? courses : lessons;

  return <section className="admin-page assessment-admin">
    <header className="admin-page-header"><div><span className="admin-page-eyebrow">Qiymətləndirmə</span><h1>Testlər</h1><p>Testləri yaradın, sualları əlavə edin və hazır olduqda yayımlayın.</p></div></header>
    {(error || message) && <div className={`assessment-floating-feedback notification ${error ? "notification-error" : "notification-success"}`} role="alert" aria-live="assertive">
      <span>{error || message}</span>
      <button type="button" onClick={() => { setError(""); setMessage(""); }} aria-label="Bildirişi bağla"><X size={19} /></button>
    </div>}
    <div className="assessment-admin-grid">
      <form className="course-admin-form" onSubmit={submitTest}>
        <h2><Plus size={20} /> Yeni test</h2>
        <input required placeholder="Testin adı" value={testForm.title} onChange={(e) => setTestForm({ ...testForm, title: e.target.value })} />
        <select value={testForm.type} onChange={(e) => setTestForm({ ...testForm, type: e.target.value, targetId: "", passScorePercent: e.target.value === "FINAL" ? 70 : 60, timeLimitMinutes: e.target.value === "FINAL" ? 30 : 1 })}>
          <option value="LESSON">Dərs testi (3–5 sual)</option><option value="FINAL">Yekun test (20–30 sual)</option>
        </select>
        <select required value={testForm.targetId} onChange={(e) => setTestForm({ ...testForm, targetId: e.target.value })}>
          <option value="">{testForm.type === "FINAL" ? "Kurs seçin" : "Dərs seçin"}</option>
          {targetOptions.map((item) => <option key={item.id} value={item.id}>{testForm.type === "FINAL" ? item.title : `${item.courseTitle} — ${item.moduleTitle} — ${item.title}`}</option>)}
        </select>
        <label>Keçid faizi<input type="number" value={testForm.passScorePercent} readOnly /></label>
        <label>Vaxt limiti (dəqiqə)<input type="number" min={testForm.type === "FINAL" ? 30 : 1} max={testForm.type === "FINAL" ? 45 : 5} value={testForm.timeLimitMinutes} readOnly={testForm.type === "LESSON"} onChange={(e) => setTestForm({ ...testForm, timeLimitMinutes: e.target.value })} /><small>{testForm.type === "LESSON" ? "Yayımlanarkən hər suala 1 dəqiqə hesablanır." : "30–45 dəqiqə"}</small></label>
        <button className="button button-primary" type="submit">Test yarat</button>
      </form>
      <div className="assessment-test-list">
        {tests.length === 0 && <p>Hələ test yaradılmayıb.</p>}
        {tests.map((test) => <article className={`assessment-test-card ${selected?.id === test.id ? "assessment-test-card-selected" : ""}`} key={test.id}>
          <button className="assessment-test-select" type="button" onClick={() => selectTest(test.id)}><ListChecks size={20} /><span><strong>{test.title}</strong><small>ID: {test.id} · {test.type === "FINAL" ? test.course?.title || "Yekun imtahan" : test.lesson?.title || "Dərs seçilməyib"} · {test._count?.questions || 0} sual</small></span></button>
          <span className={test.published ? "status-badge status-badge-success" : "status-badge"}>{test.published ? "Yayımlanıb" : "Qaralama"}</span>
          <button className="admin-icon-button admin-icon-button-danger" type="button" onClick={() => removeTest(test.id)} aria-label="Testi sil"><Trash2 size={17} /></button>
        </article>)}
      </div>
    </div>
    {selected && <section className="assessment-editor">
      <header><div><h2>{selected.title}</h2><p>ID: {selected.id} · {selected.questions.length} sual · keçid {selected.passScorePercent}%</p></div><div className="assessment-editor-actions">{selected.published && <Link className="button button-secondary" to={`/tests/${selected.id}`}>İstifadəçi kimi bax</Link>}<button className="button button-secondary" type="button" onClick={() => togglePublished(selected)}><CheckCircle2 size={18} />{selected.published ? "Qaralamaya keçir" : "Yayımla"}</button></div></header>
      <div className="assessment-question-list">{selected.questions.map((question) => <article key={question.id}><strong>{question.order}. {question.questionText}</strong><ul>{question.options.map((option) => <li key={option} className={option === question.correctValue ? "assessment-correct-answer" : ""}>{option}</li>)}</ul><button className="admin-icon-button admin-icon-button-danger" type="button" onClick={() => removeQuestion(question.id)}><Trash2 size={16} /> Sualı sil</button></article>)}</div>
      <form className="course-admin-form assessment-question-form" onSubmit={submitQuestion}>
        <h3>Yeni sual əlavə et</h3><textarea required placeholder="Sual" value={questionForm.questionText} onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })} />
        {questionForm.options.map((option, index) => <label key={index} className="assessment-option-input"><input type="radio" name="correct" checked={questionForm.correctIndex === index} onChange={() => setQuestionForm({ ...questionForm, correctIndex: index })} /><input required={index < 2} placeholder={`${index + 1}-ci cavab`} value={option} onChange={(e) => { const options = [...questionForm.options]; options[index] = e.target.value; setQuestionForm({ ...questionForm, options }); }} /></label>)}
        <button className="button button-primary" type="submit">Sual əlavə et</button>
      </form>
    </section>}
  </section>;
}
export default AdminTestsPage;
