import { useEffect, useMemo, useState } from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { getCourseStructure } from '../api/adminCoursesApi.js';
import { createLessonResource, deleteLessonResource, getLessonResources } from '../api/lessonResourcesApi.js';
import { getApiErrorMessage } from '../api/client.js';
import Notification from '../components/common/Notification.jsx';

const emptyForm = { title: '', url: '', fileType: 'PDF', description: '', order: 0 };

export default function AdminResourcesPage() {
  const [structure, setStructure] = useState({ courses: [] });
  const [lessonId, setLessonId] = useState('');
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState(null);
  const lessons = useMemo(() => structure.courses.flatMap((course) => course.modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, label: `${course.title} / ${module.title} / ${lesson.title}` })))), [structure]);

  useEffect(() => { getCourseStructure().then(setStructure).catch((error) => setNotice({ type: 'error', message: getApiErrorMessage(error) })); }, []);
  useEffect(() => { if (!lessonId) { setResources([]); return; } getLessonResources(lessonId).then(setResources).catch((error) => setNotice({ type: 'error', message: getApiErrorMessage(error) })); }, [lessonId]);

  async function submit(event) {
    event.preventDefault(); setNotice(null);
    try { const created = await createLessonResource(lessonId, { ...form, order: Number(form.order) }); setResources((items) => [...items, created].sort((a, b) => a.order - b.order)); setForm(emptyForm); setNotice({ type: 'success', message: 'Material dərsə əlavə edildi.' }); }
    catch (error) { setNotice({ type: 'error', message: getApiErrorMessage(error) }); }
  }
  async function remove(id) {
    if (!window.confirm('Bu material silinsin?')) return;
    try { await deleteLessonResource(id); setResources((items) => items.filter((item) => item.id !== id)); }
    catch (error) { setNotice({ type: 'error', message: getApiErrorMessage(error) }); }
  }

  return <section className="admin-page"><div className="admin-page-header"><div><span className="admin-page-eyebrow">Təlim idarəetməsi</span><h1>Dərs materialları</h1><p>PDF, tapşırıq və əlavə oxu keçidlərini təhlükəsiz HTTPS ünvanı ilə əlavə edin.</p></div></div>
    {notice && <Notification {...notice} onClose={() => setNotice(null)} />}
    <div className="admin-form-card"><label>Dərs<select value={lessonId} onChange={(event) => setLessonId(event.target.value)}><option value="">Dərsi seçin</option>{lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.label}</option>)}</select></label>
      {lessonId && <form className="profile-form" onSubmit={submit}><input required maxLength="150" placeholder="Materialın adı" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /><input required type="url" pattern="https://.*" placeholder="https://..." value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} /><select value={form.fileType} onChange={(event) => setForm({ ...form, fileType: event.target.value })}>{['PDF','DOC','DOCX','ZIP','LINK'].map((type) => <option key={type}>{type}</option>)}</select><textarea placeholder="Qısa təsvir" maxLength="1000" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><input type="number" min="0" value={form.order} onChange={(event) => setForm({ ...form, order: event.target.value })} /><button className="button button-primary"><Plus size={17}/> Əlavə et</button></form>}
      <div className="course-category-list">{resources.map((resource) => <span key={resource.id}><FileText size={15}/><a href={resource.url} target="_blank" rel="noreferrer">{resource.title}</a><button type="button" onClick={() => remove(resource.id)} aria-label="Materialı sil"><Trash2 size={14}/></button></span>)}</div>
    </div></section>;
}
