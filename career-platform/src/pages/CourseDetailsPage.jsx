import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, Layers3, LoaderCircle, LockKeyhole, PlayCircle } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client.js";
import { enrollInCourse, getMyCourseState, getPublishedCourse, updateLessonProgress } from "../api/coursesApi.js";
import { getLessonVideoUrl } from "../api/videoApi.js";
import ErrorState from "../components/common/ErrorState.jsx";
import Notification from "../components/common/Notification.jsx";
import PageLoader from "../components/common/PageLoader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const emptyLearningState = { enrolled: false, completedLessonIds: [], completedLessons: 0, totalLessons: 0, progressPercentage: 0 };

function CourseDetailsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isInitializing } = useAuth();
  const [course, setCourse] = useState(null);
  const [learningState, setLearningState] = useState(emptyLearningState);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [updatingLessonId, setUpdatingLessonId] = useState(null);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getPublishedCourse(courseId, { signal: controller.signal })
      .then(setCourse)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(getApiErrorMessage(requestError));
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [courseId]);

  useEffect(() => {
    if (isInitializing || !isAuthenticated) {
      if (!isInitializing) setLearningState(emptyLearningState);
      return undefined;
    }
    const controller = new AbortController();
    getMyCourseState(courseId, { signal: controller.signal })
      .then(setLearningState)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setNotification({ type: "error", message: getApiErrorMessage(requestError) });
      });
    return () => controller.abort();
  }, [courseId, isAuthenticated, isInitializing]);

  const completedLessonIds = useMemo(
    () => new Set(learningState.completedLessonIds || []),
    [learningState.completedLessonIds],
  );

  async function handleEnroll() {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/courses/${courseId}`, message: "Kursa başlamaq üçün daxil olun." } });
      return;
    }
    setIsEnrolling(true);
    setNotification(null);
    try {
      await enrollInCourse(courseId);
      setLearningState(await getMyCourseState(courseId));
      setNotification({ type: "success", message: "Kursa uğurla qeydiyyatdan keçdiniz." });
    } catch (requestError) {
      setNotification({ type: "error", message: getApiErrorMessage(requestError) });
    } finally {
      setIsEnrolling(false);
    }
  }

  async function handleOpenLesson(lesson) {
    if (!lesson.hasVideo) {
      setNotification({ type: "info", message: "Bu dərs üçün video hələ əlavə edilməyib." });
      return;
    }
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/courses/${courseId}`, message: "Video dərsə baxmaq üçün daxil olun." } });
      return;
    }
    if (user?.role !== "ADMIN" && !learningState.enrolled) {
      setNotification({ type: "info", message: "Video dərsə baxmaq üçün əvvəlcə kursa qeydiyyatdan keçin." });
      return;
    }
    setIsLoadingVideo(true);
    setNotification(null);
    try {
      const response = await getLessonVideoUrl(lesson.id);
      setSelectedLesson(lesson);
      setVideo(response);
    } catch (requestError) {
      setNotification({ type: "error", message: getApiErrorMessage(requestError) });
    } finally {
      setIsLoadingVideo(false);
    }
  }

  async function handleCompletion(lesson) {
    const completed = !completedLessonIds.has(lesson.id);
    setUpdatingLessonId(lesson.id);
    try {
      await updateLessonProgress(lesson.id, completed);
      setLearningState(await getMyCourseState(courseId));
    } catch (requestError) {
      setNotification({ type: "error", message: getApiErrorMessage(requestError) });
    } finally {
      setUpdatingLessonId(null);
    }
  }

  if (loading) return <PageLoader message="Kurs yüklənir..." fullPage />;
  if (error || !course) return <section className="section"><div className="container"><ErrorState title="Kurs tapılmadı" message={error || "Bu kurs mövcud deyil və ya yayımdan çıxarılıb."} /></div></section>;

  const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0);
  const isAdmin = user?.role === "ADMIN";

  return (
    <>
      <section className="career-detail-hero">
        <div className="container">
          <Link to="/courses" className="back-link"><ArrowLeft size={18} /> Bütün kurslar</Link>
          <div className="career-detail-heading">
            <div><span className="tag">{course.category?.name || "Kateqoriyasız"}</span><h1>{course.title}</h1><p>{course.description || "Kursun dərs proqramı ilə tanış olun."}</p></div>
            {!isAdmin && !learningState.enrolled && (
              <button type="button" className="button button-primary button-large" onClick={handleEnroll} disabled={isEnrolling || isInitializing}>
                {isEnrolling && <LoaderCircle className="loading-spinner" size={18} />}
                {isAuthenticated ? "Kursa qeydiyyatdan keç" : "Kursa başla"}
              </button>
            )}
          </div>
          <div className="career-overview">
            <div className="career-overview-item"><Layers3 size={22} /><div><span>Modullar</span><strong>{course.modules.length}</strong></div></div>
            <div className="career-overview-item"><BookOpen size={22} /><div><span>Dərslər</span><strong>{lessonCount}</strong></div></div>
            {learningState.enrolled && !isAdmin && <div className="career-overview-item"><CheckCircle2 size={22} /><div><span>İrəliləyiş</span><strong>{learningState.progressPercentage}%</strong></div></div>}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container course-public-modules">
          {notification && <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}
          {video && selectedLesson && (
            <section className="course-video-player">
              <div className="content-card-heading"><PlayCircle size={25} /><div><h2>{selectedLesson.title}</h2><p>Video keçidi təhlükəsizlik üçün məhdud müddət ərzində etibarlıdır.</p></div></div>
              <video key={video.url} controls preload="metadata" src={video.url}>Brauzeriniz video elementini dəstəkləmir.</video>
            </section>
          )}
          <div className="content-card-heading"><BookOpen size={25} /><div><h2>Kurs proqramı</h2><p>Modullar və yayımlanmış dərslər.</p></div></div>
          {course.modules.map((module) => (
            <article className="course-public-module" key={module.id}>
              <h3><Layers3 size={19} /> {module.order}. {module.title}</h3>
              {module.description && <p>{module.description}</p>}
              <ul>{module.lessons.map((lesson) => {
                const completed = completedLessonIds.has(lesson.id);
                return (
                  <li key={lesson.id} className={completed ? "course-lesson-completed" : ""}>
                    <button type="button" className="course-lesson-open" onClick={() => handleOpenLesson(lesson)} disabled={isLoadingVideo}>
                      {lesson.hasVideo ? <PlayCircle size={17} /> : <LockKeyhole size={17} />}
                      <span>{lesson.order}. {lesson.title}</span>
                    </button>
                    {lesson.durationSeconds && <small><Clock3 size={14} /> {Math.ceil(lesson.durationSeconds / 60)} dəq.</small>}
                    {learningState.enrolled && !isAdmin && (
                      <button type="button" className="course-lesson-complete" onClick={() => handleCompletion(lesson)} disabled={updatingLessonId === lesson.id}>
                        <CheckCircle2 size={17} /> {completed ? "Tamamlandı" : "Tamamla"}
                      </button>
                    )}
                  </li>
                );
              })}</ul>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default CourseDetailsPage;
