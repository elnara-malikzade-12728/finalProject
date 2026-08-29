import { useCallback, useEffect, useState } from 'react';
import { BookOpen, ChevronDown, FolderTree, Layers3, Plus, Trash2 } from 'lucide-react';
import {
  createCategory,
  createCourse,
  createLesson,
  createModule,
  deleteCategory,
  deleteCourse,
  deleteLesson,
  deleteModule,
  getCourseStructure,
  updateCourse,
  updateLesson,
} from '../api/adminCoursesApi.js';
import { getApiErrorMessage } from '../api/client.js';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Notification from '../components/common/Notification.jsx';
import PageLoader from '../components/common/PageLoader.jsx';

const initialCourse = { title: '', description: '', categoryId: '', published: false };

function AdminCoursesPage() {
  const [data, setData] = useState({ categories: [], courses: [] });
  const [categoryName, setCategoryName] = useState('');
  const [courseForm, setCourseForm] = useState(initialCourse);
  const [moduleDrafts, setModuleDrafts] = useState({});
  const [lessonDrafts, setLessonDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const response = await getCourseStructure({ signal });
      setData({ categories: response?.categories || [], courses: response?.courses || [] });
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setError(getApiErrorMessage(requestError));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function perform(action, successMessage) {
    setSaving(true);
    setNotification(null);
    try {
      await action();
      await load();
      setNotification({ type: 'success', message: successMessage });
      return true;
    } catch (requestError) {
      setNotification({ type: 'error', message: getApiErrorMessage(requestError) });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function submitCategory(event) {
    event.preventDefault();
    const ok = await perform(() => createCategory({ name: categoryName }), 'Kateqoriya yaradıldı.');
    if (ok) setCategoryName('');
  }

  async function submitCourse(event) {
    event.preventDefault();
    const ok = await perform(
      () => createCourse({ ...courseForm, categoryId: courseForm.categoryId ? Number(courseForm.categoryId) : null }),
      'Kurs yaradıldı.',
    );
    if (ok) setCourseForm(initialCourse);
  }

  async function submitModule(event, courseId) {
    event.preventDefault();
    const draft = moduleDrafts[courseId] || {};
    const ok = await perform(
      () => createModule(courseId, { title: draft.title, order: Number(draft.order) }),
      'Modul yaradıldı.',
    );
    if (ok) setModuleDrafts((current) => ({ ...current, [courseId]: { title: '', order: '' } }));
  }

  async function submitLesson(event, moduleId) {
    event.preventDefault();
    const draft = lessonDrafts[moduleId] || {};
    const ok = await perform(
      () => createLesson(moduleId, { title: draft.title, order: Number(draft.order), published: true, isFreePreview: draft.isFreePreview === true }),
      'Dərs yaradıldı.',
    );
    if (ok) setLessonDrafts((current) => ({ ...current, [moduleId]: { title: '', order: '', isFreePreview: false } }));
  }

  function confirmDelete(message, action, successMessage) {
    if (window.confirm(message)) perform(action, successMessage);
  }

  if (loading) return <PageLoader message="Kurs strukturu yüklənir..." />;
  if (error) return <ErrorState title="Kursları yükləmək mümkün olmadı" message={error} onRetry={() => load()} />;

  return (
    <section className="admin-page admin-courses-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">Təlim idarəetməsi</span>
          <h1>Kurslar</h1>
          <p>Kateqoriya, kurs, modul və dərsləri vahid strukturda idarə edin.</p>
        </div>
      </div>

      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}

      <div className="course-admin-forms">
        <form className="course-admin-form" onSubmit={submitCategory}>
          <h2><FolderTree size={20} /> Yeni kateqoriya</h2>
          <div className="course-admin-inline">
            <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Məsələn: Proqramlaşdırma" maxLength={100} required />
            <button className="button button-primary" disabled={saving}><Plus size={17} /> Əlavə et</button>
          </div>
          <div className="course-category-list">
            {data.categories.map((category) => (
              <span key={category.id}>{category.name}<button type="button" onClick={() => confirmDelete(`“${category.name}” kateqoriyası silinsin?`, () => deleteCategory(category.id), 'Kateqoriya silindi.')} aria-label="Kateqoriyanı sil"><Trash2 size={14} /></button></span>
            ))}
          </div>
        </form>

        <form className="course-admin-form" onSubmit={submitCourse}>
          <h2><BookOpen size={20} /> Yeni kurs</h2>
          <input value={courseForm.title} onChange={(event) => setCourseForm({ ...courseForm, title: event.target.value })} placeholder="Kursun adı" maxLength={150} required />
          <textarea value={courseForm.description} onChange={(event) => setCourseForm({ ...courseForm, description: event.target.value })} placeholder="Qısa təsvir" rows={2} />
          <select value={courseForm.categoryId} onChange={(event) => setCourseForm({ ...courseForm, categoryId: event.target.value })}>
            <option value="">Kateqoriyasız</option>
            {data.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <label className="course-publish-check"><input type="checkbox" checked={courseForm.published} onChange={(event) => setCourseForm({ ...courseForm, published: event.target.checked })} /> Dərhal yayımla</label>
          <button className="button button-primary" disabled={saving}><Plus size={17} /> Kurs yarat</button>
        </form>
      </div>

      {data.courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="Kurs yoxdur" message="İlk kursu yaradaraq təlim strukturunu formalaşdırın." />
      ) : (
        <div className="course-tree">
          {data.courses.map((course) => (
            <details className="course-tree-course" key={course.id} open>
              <summary>
                <span><ChevronDown size={18} /><strong>{course.title}</strong><small>{course.category?.name || 'Kateqoriyasız'} · {course.published ? 'Yayımdadır' : 'Qaralama'}</small></span>
                <span className="course-tree-actions">
                  <button type="button" onClick={(event) => { event.preventDefault(); perform(() => updateCourse(course.id, { published: !course.published }), course.published ? 'Kurs qaralamaya keçirildi.' : 'Kurs yayımlandı.'); }}>{course.published ? 'Gizlət' : 'Yayımla'}</button>
                  <button type="button" className="danger" onClick={(event) => { event.preventDefault(); confirmDelete(`“${course.title}” kursu və bütün dərsləri silinsin?`, () => deleteCourse(course.id), 'Kurs silindi.'); }}><Trash2 size={16} /></button>
                </span>
              </summary>

              <div className="course-tree-body">
                {course.modules.map((module) => (
                  <section className="course-tree-module" key={module.id}>
                    <header><span><Layers3 size={17} /><strong>{module.order}. {module.title}</strong></span><button type="button" className="danger" onClick={() => confirmDelete(`“${module.title}” modulu silinsin?`, () => deleteModule(module.id), 'Modul silindi.')}><Trash2 size={15} /></button></header>
                    <ul>
                      {module.lessons.map((lesson) => <li key={lesson.id}><span>{lesson.order}. {lesson.title} {lesson.isFreePreview && <small>· Pulsuz baxış</small>}</span><span><button type="button" onClick={() => perform(() => updateLesson(lesson.id, { isFreePreview: !lesson.isFreePreview }), lesson.isFreePreview ? 'Pulsuz baxış söndürüldü.' : 'Pulsuz baxış aktiv edildi.')}>{lesson.isFreePreview ? 'Preview söndür' : 'Pulsuz preview'}</button><button type="button" className="danger" onClick={() => confirmDelete(`“${lesson.title}” dərsi silinsin?`, () => deleteLesson(lesson.id), 'Dərs silindi.')}><Trash2 size={14} /></button></span></li>)}
                    </ul>
                    <form className="course-tree-add" onSubmit={(event) => submitLesson(event, module.id)}>
                      <input value={lessonDrafts[module.id]?.order || ''} onChange={(event) => setLessonDrafts({ ...lessonDrafts, [module.id]: { ...lessonDrafts[module.id], order: event.target.value } })} type="number" min="0" placeholder="Sıra" required />
                      <input value={lessonDrafts[module.id]?.title || ''} onChange={(event) => setLessonDrafts({ ...lessonDrafts, [module.id]: { ...lessonDrafts[module.id], title: event.target.value } })} placeholder="Yeni dərsin adı" required />
                      <label><input type="checkbox" checked={lessonDrafts[module.id]?.isFreePreview || false} onChange={(event) => setLessonDrafts({ ...lessonDrafts, [module.id]: { ...lessonDrafts[module.id], isFreePreview: event.target.checked } })} /> Pulsuz preview</label>
                      <button className="button button-secondary" disabled={saving}><Plus size={16} /> Dərs</button>
                    </form>
                  </section>
                ))}
                <form className="course-tree-add" onSubmit={(event) => submitModule(event, course.id)}>
                  <input value={moduleDrafts[course.id]?.order || ''} onChange={(event) => setModuleDrafts({ ...moduleDrafts, [course.id]: { ...moduleDrafts[course.id], order: event.target.value } })} type="number" min="0" placeholder="Sıra" required />
                  <input value={moduleDrafts[course.id]?.title || ''} onChange={(event) => setModuleDrafts({ ...moduleDrafts, [course.id]: { ...moduleDrafts[course.id], title: event.target.value } })} placeholder="Yeni modulun adı" required />
                  <button className="button button-primary" disabled={saving}><Plus size={16} /> Modul</button>
                </form>
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

export default AdminCoursesPage;
