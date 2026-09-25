import { useEffect, useMemo, useState } from "react";
import { GraduationCap } from "lucide-react";
import { getCourseStructure } from "../api/adminCoursesApi.js";
import { getApiErrorMessage } from "../api/client.js";
import VideoUploader from "../components/admin/VideoUploader.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

function AdminVideoPage() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getCourseStructure({ signal: controller.signal })
      .then((response) => {
        const nextCourses = Array.isArray(response?.courses) ? response.courses : [];
        setCourses(nextCourses);
        setCourseId(nextCourses[0]?.id ? String(nextCourses[0].id) : "");
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(getApiErrorMessage(requestError));
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const selectedCourse = useMemo(
    () => courses.find((course) => String(course.id) === courseId),
    [courseId, courses],
  );
  const modules = selectedCourse?.modules || [];
  const selectedModule = modules.find((module) => String(module.id) === moduleId);
  const lessons = selectedModule?.lessons || [];

  useEffect(() => {
    setModuleId(modules[0]?.id ? String(modules[0].id) : "");
  }, [courseId]);

  useEffect(() => {
    setLessonId(lessons[0]?.id ? String(lessons[0].id) : "");
  }, [moduleId]);

  if (loading) return <PageLoader message="Kurs strukturu yüklənir..." />;
  if (error) return <ErrorState title="Dərsləri yükləmək mümkün olmadı" message={error} />;

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">Təlim idarəetməsi</span>
          <h1>Video dərslər</h1>
          <p>Dərs üçün təhlükəsiz video yükləyin və mövcud videonu idarə edin.</p>
        </div>
      </div>

      <div className="admin-video-lesson-selector">
        <div className="admin-video-selector-heading">
          <span className="admin-form-icon"><GraduationCap size={22} aria-hidden="true" /></span>
          <div><h2>Dərsi seçin</h2><p>Videonu düzgün kurs, modul və dərslə əlaqələndirin.</p></div>
        </div>

        {courses.length === 0 ? (
          <p>Video əlavə etmək üçün əvvəlcə kurs, modul və dərs yaradın.</p>
        ) : (
          <div className="admin-video-select-grid">
            <label>Kurs
              <select value={courseId} onChange={(event) => setCourseId(event.target.value)}>
                {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
              </select>
            </label>
            <label>Modul
              <select value={moduleId} onChange={(event) => setModuleId(event.target.value)} disabled={modules.length === 0}>
                {modules.length === 0 ? <option value="">Modul yoxdur</option> : modules.map((module) => <option key={module.id} value={module.id}>{module.order}. {module.title}</option>)}
              </select>
            </label>
            <label>Dərs
              <select value={lessonId} onChange={(event) => setLessonId(event.target.value)} disabled={lessons.length === 0}>
                {lessons.length === 0 ? <option value="">Dərs yoxdur</option> : lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.order}. {lesson.title}</option>)}
              </select>
            </label>
          </div>
        )}
      </div>

      {lessonId ? <VideoUploader key={lessonId} lessonId={Number(lessonId)} /> : null}
    </section>
  );
}

export default AdminVideoPage;
