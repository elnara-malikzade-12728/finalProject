import { useCallback, useEffect, useState } from 'react';
import { BookOpen, ChevronDown, FolderTree, Layers3, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
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
  updateCategory,
  updateLesson,
  updateModule,
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
  const [categoryParentId, setCategoryParentId] = useState('');
  const [courseForm, setCourseForm] = useState(initialCourse);
  const [moduleDrafts, setModuleDrafts] = useState({});
  const [lessonDrafts, setLessonDrafts] = useState({});
  const [categoryEdit, setCategoryEdit] = useState(null);
  const [courseEdit, setCourseEdit] = useState(null);
  const [moduleEdit, setModuleEdit] = useState(null);
  const [lessonEdit, setLessonEdit] = useState(null);
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
    const ok = await perform(() => createCategory({ name: categoryName, parentId: categoryParentId ? Number(categoryParentId) : null }), 'Kateqoriya yaradıldı.');
    if (ok) { setCategoryName(''); setCategoryParentId(''); }
  }

  async function submitCourse(event) {
    event.preventDefault();
    const ok = await perform(
      () => createCourse({ ...courseForm, categoryId: courseForm.categoryId ? Number(courseForm.categoryId) : null }),
      'Kurs yaradıldı.',
    );
    if (ok) setCourseForm(initialCourse);
  }

  async function submitCategoryEdit(event) {
    event.preventDefault();
    const ok = await perform(() => updateCategory(categoryEdit.id, { name: categoryEdit.name, description: categoryEdit.description, order: Number(categoryEdit.order) || 0, parentId: categoryEdit.parentId ? Number(categoryEdit.parentId) : null }), 'Kateqoriya yeniləndi.');
    if (ok) setCategoryEdit(null);
  }

  async function submitCourseEdit(event) {
    event.preventDefault();
    const ok = await perform(() => updateCourse(courseEdit.id, { title: courseEdit.title, description: courseEdit.description, categoryId: courseEdit.categoryId ? Number(courseEdit.categoryId) : null, published: courseEdit.published }), 'Kurs yeniləndi.');
    if (ok) setCourseEdit(null);
  }

  async function submitModuleEdit(event) {
    event.preventDefault();
    const ok = await perform(() => updateModule(moduleEdit.id, { title: moduleEdit.title, description: moduleEdit.description, order: Number(moduleEdit.order) }), 'Modul yeniləndi.');
    if (ok) setModuleEdit(null);
  }

  async function submitLessonEdit(event) {
    event.preventDefault();
    const ok = await perform(() => updateLesson(lessonEdit.id, { title: lessonEdit.title, description: lessonEdit.description, order: Number(lessonEdit.order), published: lessonEdit.published, isFreePreview: lessonEdit.isFreePreview }), 'Dərs yeniləndi.');
    if (ok) setLessonEdit(null);
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
            <select value={categoryParentId} onChange={(event) => setCategoryParentId(event.target.value)}>
              <option value="">Ana kateqoriya</option>
              {data.categories.filter((category) => !category.parentId).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <button className="button button-primary" disabled={saving}><Plus size={17} /> Əlavə et</button>
          </div>
          <div className="course-category-list">
            {data.categories.map((category) => (
              <span key={category.id}>{category.parent ? `${category.parent.name} / ` : ''}{category.name}<button type="button" onClick={() => setCategoryEdit({ id: category.id, name: category.name, description: category.description || '', order: category.order, parentId: category.parentId || '' })} aria-label="Kateqoriyanı redaktə et"><Pencil size={14} /></button><button type="button" onClick={() => confirmDelete(`“${category.name}” kateqoriyası silinsin?`, () => deleteCategory(category.id), 'Kateqoriya silindi.')} aria-label="Kateqoriyanı sil"><Trash2 size={14} /></button></span>
            ))}
          </div>
          {categoryEdit && <form className="course-inline-editor" onSubmit={submitCategoryEdit}><h3>Kateqoriyanı redaktə et</h3><input value={categoryEdit.name} onChange={(event) => setCategoryEdit({ ...categoryEdit, name: event.target.value })} required /><textarea value={categoryEdit.description} onChange={(event) => setCategoryEdit({ ...categoryEdit, description: event.target.value })} placeholder="Təsvir" rows={2} /><div className="course-edit-row"><input type="number" min="0" value={categoryEdit.order} onChange={(event) => setCategoryEdit({ ...categoryEdit, order: event.target.value })} /><select value={categoryEdit.parentId} onChange={(event) => setCategoryEdit({ ...categoryEdit, parentId: event.target.value })}><option value="">Ana kateqoriya</option>{data.categories.filter((item) => !item.parentId && item.id !== categoryEdit.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><div className="course-edit-actions"><button className="button button-primary" disabled={saving}><Save size={16} /> Saxla</button><button type="button" className="button button-secondary" onClick={() => setCategoryEdit(null)}><X size={16} /> Ləğv et</button></div></form>}
        </form>

        <form className="course-admin-form" onSubmit={submitCourse}>
          <h2><BookOpen size={20} /> Yeni kurs</h2>
          <input value={courseForm.title} onChange={(event) => setCourseForm({ ...courseForm, title: event.target.value })} placeholder="Kursun adı" maxLength={150} required />
          <textarea value={courseForm.description} onChange={(event) => setCourseForm({ ...courseForm, description: event.target.value })} placeholder="Qısa təsvir" rows={2} />
          <select value={courseForm.categoryId} onChange={(event) => setCourseForm({ ...courseForm, categoryId: event.target.value })}>
            <option value="">Kateqoriyasız</option>
            {data.categories.filter((category) => category.parentId).map((category) => <option key={category.id} value={category.id}>{category.parent?.name} / {category.name}</option>)}
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
                <span><ChevronDown size={18} /><strong>{course.title}</strong><small>{course.category?.parent ? `${course.category.parent.name} / ` : ''}{course.category?.name || 'Kateqoriyasız'} · {course.published ? 'Yayımdadır' : 'Qaralama'}</small></span>
                <span className="course-tree-actions">
                  <button type="button" title="Kursu redaktə et" aria-label="Kursu redaktə et" onClick={(event) => { event.preventDefault(); setCourseEdit({ id: course.id, title: course.title, description: course.description || '', categoryId: course.categoryId || '', published: course.published }); }}><Pencil size={16} /></button>
                  <button type="button" onClick={(event) => { event.preventDefault(); perform(() => updateCourse(course.id, { published: !course.published }), course.published ? 'Kurs qaralamaya keçirildi.' : 'Kurs yayımlandı.'); }}>{course.published ? 'Gizlət' : 'Yayımla'}</button>
                  <button type="button" className="danger" onClick={(event) => { event.preventDefault(); confirmDelete(`“${course.title}” kursu və bütün dərsləri silinsin?`, () => deleteCourse(course.id), 'Kurs silindi.'); }}><Trash2 size={16} /></button>
                </span>
              </summary>

              <div className="course-tree-body">
                {courseEdit?.id === course.id && <form className="course-inline-editor" onSubmit={submitCourseEdit}><h3>Kursu redaktə et</h3><input value={courseEdit.title} onChange={(event) => setCourseEdit({ ...courseEdit, title: event.target.value })} required /><textarea value={courseEdit.description} onChange={(event) => setCourseEdit({ ...courseEdit, description: event.target.value })} rows={3} placeholder="Kursun təsviri" /><select value={courseEdit.categoryId} onChange={(event) => setCourseEdit({ ...courseEdit, categoryId: event.target.value })}><option value="">Kateqoriyasız</option>{data.categories.filter((category) => category.parentId).map((category) => <option key={category.id} value={category.id}>{category.parent?.name} / {category.name}</option>)}</select><label className="course-publish-check"><input type="checkbox" checked={courseEdit.published} onChange={(event) => setCourseEdit({ ...courseEdit, published: event.target.checked })} /> Yayımla</label><div className="course-edit-actions"><button className="button button-primary" disabled={saving}><Save size={16} /> Saxla</button><button type="button" className="button button-secondary" onClick={() => setCourseEdit(null)}><X size={16} /> Ləğv et</button></div></form>}
                {course.modules.map((module) => (
                  <section className="course-tree-module" key={module.id}>
                    <header><span><Layers3 size={17} /><strong>{module.order}. {module.title}</strong></span><span><button type="button" title="Modulu redaktə et" aria-label="Modulu redaktə et" onClick={() => setModuleEdit({ id: module.id, title: module.title, description: module.description || '', order: module.order })}><Pencil size={16} /></button><button type="button" className="danger" onClick={() => confirmDelete(`“${module.title}” modulu silinsin?`, () => deleteModule(module.id), 'Modul silindi.')}><Trash2 size={15} /></button></span></header>
                    {moduleEdit?.id === module.id && <form className="course-inline-editor" onSubmit={submitModuleEdit}><input type="number" min="0" value={moduleEdit.order} onChange={(event) => setModuleEdit({ ...moduleEdit, order: event.target.value })} required /><input value={moduleEdit.title} onChange={(event) => setModuleEdit({ ...moduleEdit, title: event.target.value })} required /><textarea value={moduleEdit.description} onChange={(event) => setModuleEdit({ ...moduleEdit, description: event.target.value })} placeholder="Modulun təsviri" rows={2} /><div className="course-edit-actions"><button className="button button-primary" disabled={saving}><Save size={16} /> Saxla</button><button type="button" className="button button-secondary" onClick={() => setModuleEdit(null)}><X size={16} /> Ləğv et</button></div></form>}
                    <ul>
                      {module.lessons.map((lesson) => lessonEdit?.id === lesson.id ? <li className="course-lesson-edit-item" key={lesson.id}><form className="course-inline-editor" onSubmit={submitLessonEdit}><div className="course-edit-row"><input type="number" min="0" value={lessonEdit.order} onChange={(event) => setLessonEdit({ ...lessonEdit, order: event.target.value })} required /><input value={lessonEdit.title} onChange={(event) => setLessonEdit({ ...lessonEdit, title: event.target.value })} required /></div><textarea value={lessonEdit.description} onChange={(event) => setLessonEdit({ ...lessonEdit, description: event.target.value })} placeholder="Dərsin təsviri" rows={2} /><div className="course-edit-checks"><label><input type="checkbox" checked={lessonEdit.published} onChange={(event) => setLessonEdit({ ...lessonEdit, published: event.target.checked })} /> Yayımla</label><label><input type="checkbox" checked={lessonEdit.isFreePreview} onChange={(event) => setLessonEdit({ ...lessonEdit, isFreePreview: event.target.checked })} /> Pulsuz preview</label></div><div className="course-edit-actions"><button className="button button-primary" disabled={saving}><Save size={16} /> Saxla</button><button type="button" className="button button-secondary" onClick={() => setLessonEdit(null)}><X size={16} /> Ləğv et</button></div></form></li> : <li key={lesson.id}><span>{lesson.order}. {lesson.title} {lesson.isFreePreview && <small>· Pulsuz baxış</small>} {!lesson.published && <small>· Qaralama</small>}</span><span><button type="button" title="Dərsi redaktə et" aria-label="Dərsi redaktə et" onClick={() => setLessonEdit({ id: lesson.id, title: lesson.title, description: lesson.description || '', order: lesson.order, published: lesson.published, isFreePreview: lesson.isFreePreview })}><Pencil size={16} /></button><button type="button" onClick={() => perform(() => updateLesson(lesson.id, { isFreePreview: !lesson.isFreePreview }), lesson.isFreePreview ? 'Pulsuz baxış söndürüldü.' : 'Pulsuz baxış aktiv edildi.')}>{lesson.isFreePreview ? 'Preview söndür' : 'Pulsuz preview'}</button><button type="button" className="danger" onClick={() => confirmDelete(`“${lesson.title}” dərsi silinsin?`, () => deleteLesson(lesson.id), 'Dərs silindi.')}><Trash2 size={14} /></button></span></li>)}
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
