import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, Layers3, LoaderCircle, LockKeyhole, PlayCircle } from "lucide-react";
import playerjs from "player.js";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client.js";
import { enrollInCourse, getMyCourseState, getPublishedCourse, updateLessonProgress } from "../api/coursesApi.js";
import { getLessonVideoUrl } from "../api/videoApi.js";
import ErrorState from "../components/common/ErrorState.jsx";
import Notification from "../components/common/Notification.jsx";
import PageLoader from "../components/common/PageLoader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const emptyLearningState = { enrolled: false, completedLessonIds: [], lessonProgress: {}, completedLessons: 0, totalLessons: 0, progressPercentage: 0 };

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
  const videoPlayerRef = useRef(null);
  const bunnyIframeRef = useRef(null);

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

  useEffect(() => {
    if (!video || !selectedLesson || !videoPlayerRef.current) return;
    videoPlayerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [video, selectedLesson]);

  useEffect(() => {
    if (video?.playbackType !== "embed" || !selectedLesson || !bunnyIframeRef.current || !learningState.enrolled || user?.role === "ADMIN") return undefined;

    const player = new playerjs.Player(bunnyIframeRef.current);
    let active = true;
    const handleEnded = async () => {
      if (!active) return;
      setUpdatingLessonId(selectedLesson.id);
      try {
        await updateLessonProgress(selectedLesson.id, 100, 0);
        if (!active) return;
        setLearningState(await getMyCourseState(courseId));
        if (active) setNotification({ type: "success", message: "Video tamamlandı və dərs tamamlanmış kimi qeyd edildi." });
      } catch (requestError) {
        if (active) setNotification({ type: "error", message: getApiErrorMessage(requestError) });
      } finally {
        if (active) setUpdatingLessonId(null);
      }
    };

    player.on("ended", handleEnded);
    return () => {
      active = false;
      player.off("ended", handleEnded);
    };
  }, [courseId, learningState.enrolled, selectedLesson, user?.role, video]);

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
    if (!isAuthenticated && !lesson.isFreePreview) {
      navigate("/login", { state: { from: `/courses/${courseId}`, message: "Video dərsə baxmaq üçün daxil olun." } });
      return;
    }
    if (user?.role !== "ADMIN" && !learningState.enrolled && !lesson.isFreePreview) {
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
      await updateLessonProgress(lesson.id, completed ? 100 : 0, 0);
      setLearningState(await getMyCourseState(courseId));
      setNotification({ type: "success", message: completed ? "Dərs tamamlandı." : "Dərs başlanmamış kimi qeyd edildi." });
    } catch (requestError) {
      setNotification({ type: "error", message: getApiErrorMessage(requestError) });
    } finally {
      setUpdatingLessonId(null);
    }
  }

  async function handleVideoProgress(event) {
    if (!selectedLesson || isAdmin || !learningState.enrolled || !event.currentTarget.duration) return;
    const watchedPercentage = Math.min(100, Math.round((event.currentTarget.currentTime / event.currentTarget.duration) * 100));
    if (watchedPercentage % 5 !== 0) return;
    const previous = learningState.lessonProgress?.[selectedLesson.id]?.watchedPercentage || 0;
    if (watchedPercentage <= previous) return;
    await updateLessonProgress(selectedLesson.id, watchedPercentage, Math.floor(event.currentTarget.currentTime));
    if (watchedPercentage >= 90) {
      setLearningState(await getMyCourseState(courseId));
      return;
    }
    setLearningState((current) => ({ ...current, lessonProgress: { ...current.lessonProgress, [selectedLesson.id]: { watchedPercentage, lastPositionSeconds: Math.floor(event.currentTarget.currentTime) } } }));
  }

  function handleVideoLoaded(event) {
    const lastPosition = learningState.lessonProgress?.[selectedLesson?.id]?.lastPositionSeconds || 0;
    if (lastPosition > 0 && lastPosition < event.currentTarget.duration - 5) {
      event.currentTarget.currentTime = lastPosition;
    }
  }

  if (loading) return <PageLoader message="Kurs yüklənir..." fullPage />;
  if (error || !course) return <section className="section"><div className="container"><ErrorState title="Kurs tapılmadı" message={error || "Bu kurs mövcud deyil və ya yayımdan çıxarılıb."} /></div></section>;

  const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0);
  const isAdmin = user?.role === "ADMIN";
  const orderedLessons = course.modules.flatMap((module) => module.lessons);
  const inProgressLesson = orderedLessons.find((lesson) => {
    const percentage = learningState.lessonProgress?.[lesson.id]?.watchedPercentage || 0;
    return percentage > 0 && !completedLessonIds.has(lesson.id);
  });
  const nextLesson = inProgressLesson || orderedLessons.find((lesson) => !completedLessonIds.has(lesson.id)) || orderedLessons[0];

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
          {learningState.enrolled && !isAdmin && (
            <section className="course-progress-card" aria-label="Kurs irəliləyişi">
              <div className="course-progress-heading">
                <div>
                  <span>Kurs irəliləyişi</span>
                  <strong>{learningState.completedLessons}/{learningState.totalLessons} dərs tamamlandı</strong>
                </div>
                <strong>{learningState.progressPercentage}%</strong>
              </div>
              <div className="progress-track" role="progressbar" aria-label="Kursun tamamlanma faizi" aria-valuemin="0" aria-valuemax="100" aria-valuenow={learningState.progressPercentage}>
                <span style={{ width: `${learningState.progressPercentage}%` }} />
              </div>
              {nextLesson && (
                <button type="button" className="button button-primary" onClick={() => handleOpenLesson(nextLesson)} disabled={isLoadingVideo || learningState.progressPercentage === 100}>
                  <PlayCircle size={18} />
                  {learningState.progressPercentage === 100 ? "Kurs tamamlandı" : learningState.completedLessons > 0 || inProgressLesson ? "Davam et" : "İlk dərsə başla"}
                </button>
              )}
            </section>
          )}
          {video && selectedLesson && (
            <section ref={videoPlayerRef} className="course-video-player">
              <div className="content-card-heading"><PlayCircle size={25} /><div><h2>{selectedLesson.title}</h2><p>Video keçidi təhlükəsizlik üçün məhdud müddət ərzində etibarlıdır.</p></div></div>
              <div className="secure-video-frame">
                {video.playbackType === "embed" ? (
                  <iframe ref={bunnyIframeRef} key={video.url} src={video.url} title={selectedLesson.title} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowFullScreen />
                ) : (
                  <video key={video.url} controls preload="metadata" src={video.url} onLoadedMetadata={handleVideoLoaded} onTimeUpdate={handleVideoProgress}>Brauzeriniz video elementini dəstəkləmir.</video>
                )}
                {video.watermark && <span className="video-user-watermark">{video.watermark.email} · ID {video.watermark.userId}</span>}
              </div>
            </section>
          )}
          <div className="content-card-heading"><BookOpen size={25} /><div><h2>Kurs proqramı</h2><p>Modullar və yayımlanmış dərslər.</p></div></div>
          {course.modules.map((module) => (
            <article className="course-public-module" key={module.id}>
              <h3><Layers3 size={19} /> {module.order}. {module.title}</h3>
              {module.description && <p>{module.description}</p>}
              <ul>{module.lessons.map((lesson) => {
                const completed = completedLessonIds.has(lesson.id);
                const watchedPercentage = learningState.lessonProgress?.[lesson.id]?.watchedPercentage || 0;
                const lessonStatus = completed ? "Tamamlandı" : watchedPercentage > 0 ? `Davam edir · ${watchedPercentage}%` : "Başlanmayıb";
                return (
                  <li key={lesson.id} className={completed ? "course-lesson-completed" : ""}>
                    <button type="button" className="course-lesson-open" onClick={() => handleOpenLesson(lesson)} disabled={isLoadingVideo}>
                      {lesson.hasVideo ? <PlayCircle size={17} /> : <LockKeyhole size={17} />}
                      <span>{lesson.order}. {lesson.title}</span>
                    </button>
                    {lesson.durationSeconds && <small><Clock3 size={14} /> {Math.ceil(lesson.durationSeconds / 60)} dəq.</small>}
                    {learningState.enrolled && !isAdmin && (completed ? (
                      <button
                        type="button"
                        className="course-lesson-status is-complete"
                        title="Başlanmayıb kimi qeyd et"
                        aria-label={`${lesson.title} dərsini başlanmayıb kimi qeyd et`}
                        onClick={() => handleCompletion(lesson)}
                        disabled={updatingLessonId === lesson.id}
                      >
                        <CheckCircle2 size={15} aria-hidden="true" /> Tamamlandı
                      </button>
                    ) : (
                      <span className={`course-lesson-status ${watchedPercentage > 0 ? "is-progress" : ""}`}>
                        {lessonStatus}
                      </span>
                    ))}
                    {learningState.enrolled && !isAdmin && !completed && (
                      <button type="button" className="course-lesson-complete" onClick={() => handleCompletion(lesson)} disabled={updatingLessonId === lesson.id}>
                        <CheckCircle2 size={17} /> Tamamla
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
