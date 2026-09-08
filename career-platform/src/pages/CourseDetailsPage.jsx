import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, FileText, Layers3, ListChecks, LoaderCircle, LockKeyhole, PlayCircle } from "lucide-react";
import playerjs from "player.js";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client.js";
import { enrollInCourse, getMyCourseState, getPublishedCourse, updateLessonProgress } from "../api/coursesApi.js";
import { getLessonVideoUrl } from "../api/videoApi.js";
import { getMyAttempts } from "../api/testsApi.js";
import ErrorState from "../components/common/ErrorState.jsx";
import Notification from "../components/common/Notification.jsx";
import PageLoader from "../components/common/PageLoader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import TestAudioExplanation from "../components/tests/TestAudioExplanation.jsx";
import { getLessonResources } from "../api/lessonResourcesApi.js";

const emptyLearningState = { enrolled: false, hasAccess: false, completedLessonIds: [], lockedLessonIds: [], lessonProgress: {}, completedLessons: 0, totalLessons: 0, progressPercentage: 0 };

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
  const [submittedTestIds, setSubmittedTestIds] = useState(new Set());
  const [lessonResources, setLessonResources] = useState([]);
  const notificationRef = useRef(null);
  const videoPlayerRef = useRef(null);
  const bunnyIframeRef = useRef(null);
  const maxWatchedSecondsRef = useRef(0);
  const lastReportedSecondRef = useRef(0);

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
    if (isInitializing || !isAuthenticated || user?.role === "ADMIN") {
      if (!isInitializing) setSubmittedTestIds(new Set());
      return undefined;
    }
    const controller = new AbortController();
    getMyAttempts({ signal: controller.signal })
      .then((attempts) => setSubmittedTestIds(new Set(
        (attempts || []).filter((attempt) => attempt.status === "SUBMITTED").map((attempt) => attempt.testId),
      )))
      .catch(() => {});
    return () => controller.abort();
  }, [isAuthenticated, isInitializing, user?.role]);

  useEffect(() => {
    if (!video || !selectedLesson || !videoPlayerRef.current) return;
    const savedPosition = learningState.lessonProgress?.[selectedLesson.id]?.lastPositionSeconds || 0;
    maxWatchedSecondsRef.current = savedPosition;
    lastReportedSecondRef.current = savedPosition;
    videoPlayerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [video, selectedLesson]);

  useEffect(() => {
    if (video?.playbackType !== "embed" || !selectedLesson || !bunnyIframeRef.current || !learningState.enrolled || user?.role === "ADMIN") return undefined;

    const player = new playerjs.Player(bunnyIframeRef.current);
    let active = true;
    let completionRequested = false;
    let completionConfirmed = false;
    let playerDurationSeconds = 0;
    const persistPosition = async (seconds, { force = false } = {}) => {
      const safeSecond = Math.max(0, Math.floor(Number(seconds) || 0));
      if (!active || (!force && safeSecond <= lastReportedSecondRef.current)) return null;
      try {
        const progress = await updateLessonProgress(selectedLesson.id, 0, safeSecond);
        if (!active) return progress;
        lastReportedSecondRef.current = progress.lastPositionSeconds;
        setLearningState((current) => ({ ...current, lessonProgress: { ...current.lessonProgress, [selectedLesson.id]: progress } }));
        return progress;
      } catch (requestError) {
        if (active) setNotification({ type: "error", message: getApiErrorMessage(requestError) });
        throw requestError;
      }
    };
    const handleEnded = async (data = {}) => {
      if (!active || completionRequested || completionConfirmed) return;
      completionRequested = true;
      setUpdatingLessonId(selectedLesson.id);
      try {
        const finalSecond = Number(data.duration)
          || playerDurationSeconds
          || Number(video.durationSeconds)
          || Number(selectedLesson.durationSeconds)
          || maxWatchedSecondsRef.current;
        const progress = await persistPosition(finalSecond, { force: true });
        if (!active) return;
        setLearningState(await getMyCourseState(courseId));
        if (active && progress?.completed) {
          completionConfirmed = true;
          setNotification({ type: "success", message: "Video tamamlandı və dərs tamamlanmış kimi qeyd edildi." });
        } else if (active) {
          setNotification({ type: "error", message: "Video sona çatdı, amma dərsin tamamlanması təsdiqlənmədi. Səhifəni yeniləyib videonun son hissəsini yenidən izləyin." });
        }
      } catch (requestError) {
        if (active) setNotification({ type: "error", message: getApiErrorMessage(requestError) });
      } finally {
        completionRequested = false;
        if (active) setUpdatingLessonId(null);
      }
    };
    const handleTimeUpdate = (data = {}) => {
      const seconds = Math.max(0, Number(data.seconds) || 0);
      if (seconds > maxWatchedSecondsRef.current + 4) {
        player.setCurrentTime(maxWatchedSecondsRef.current);
        return;
      }
      maxWatchedSecondsRef.current = Math.max(maxWatchedSecondsRef.current, seconds);
      const duration = Number(data.duration) || 0;
      if (duration > 0) playerDurationSeconds = duration;
      if (duration > 0 && seconds >= duration - 1) {
        handleEnded({ duration });
      } else if (seconds - lastReportedSecondRef.current >= 10) {
        persistPosition(seconds).catch(() => {});
      }
    };

    player.on("timeupdate", handleTimeUpdate);
    player.on("ended", handleEnded);
    const progressSampler = window.setInterval(() => {
      if (!active || completionConfirmed) return;
      player.getCurrentTime((seconds) => {
        if (!active) return;
        player.getDuration((duration) => {
          if (active) handleTimeUpdate({ seconds, duration });
        });
      });
    }, 5000);
    return () => {
      active = false;
      window.clearInterval(progressSampler);
      player.off("timeupdate", handleTimeUpdate);
      player.off("ended", handleEnded);
    };
  }, [courseId, learningState.enrolled, selectedLesson, user?.role, video]);

  const completedLessonIds = useMemo(
    () => new Set(learningState.completedLessonIds || []),
    [learningState.completedLessonIds],
  );
  const lockedLessonIds = useMemo(
    () => new Set(learningState.lockedLessonIds || []),
    [learningState.lockedLessonIds],
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

  function showLessonNotification(type, message) {
    setNotification({ type, message });
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        notificationRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  async function handleOpenLesson(lesson) {
    if (lockedLessonIds.has(lesson.id)) {
      showLessonNotification("info", "Bu dərsi açmaq üçün əvvəlki dərsi və onun testini tamamlayın.");
      return;
    }
    if (!lesson.hasVideo) {
      showLessonNotification("info", "Bu dərs üçün video hələ əlavə edilməyib.");
      return;
    }
    if (!isAuthenticated && !lesson.isFreePreview) {
      navigate("/login", { state: { from: `/courses/${courseId}`, message: "Video dərsə baxmaq üçün daxil olun." } });
      return;
    }
    if (user?.role !== "ADMIN" && !lesson.isFreePreview) {
      if (!learningState.hasAccess) {
        showLessonNotification("info", "Bu videoya baxmaq üçün aktiv abunəlik və ya kurs alışı tələb olunur.");
        return;
      }
      if (!learningState.enrolled) {
        showLessonNotification("info", "Video dərsə baxmaq üçün əvvəlcə kursa qeydiyyatdan keçin.");
        return;
      }
    }
    setIsLoadingVideo(true);
    setNotification(null);
    try {
      if (isAuthenticated && user?.role !== "ADMIN" && lesson.isFreePreview && !learningState.enrolled) {
        await enrollInCourse(courseId);
        setLearningState(await getMyCourseState(courseId));
      }
      const [response, resources] = await Promise.all([
        getLessonVideoUrl(lesson.id),
        getLessonResources(lesson.id).catch(() => []),
      ]);
      setSelectedLesson(lesson);
      setVideo(response);
      setLessonResources(Array.isArray(resources) ? resources : []);
    } catch (requestError) {
      showLessonNotification("error", getApiErrorMessage(requestError));
    } finally {
      setIsLoadingVideo(false);
    }
  }

  async function handleVideoProgress(event) {
    if (!selectedLesson || isAdmin || !learningState.enrolled || !event.currentTarget.duration) return;
    const currentSecond = Math.floor(event.currentTarget.currentTime);
    if (currentSecond > maxWatchedSecondsRef.current + 3) {
      event.currentTarget.currentTime = maxWatchedSecondsRef.current;
      return;
    }
    maxWatchedSecondsRef.current = Math.max(maxWatchedSecondsRef.current, currentSecond);
    const isAtEnd = currentSecond >= Math.floor(event.currentTarget.duration) - 2;
    if (!isAtEnd && currentSecond - lastReportedSecondRef.current < 10) return;
    const progress = await updateLessonProgress(selectedLesson.id, 0, currentSecond);
    lastReportedSecondRef.current = progress.lastPositionSeconds;
    if (progress.completed) {
      setLearningState(await getMyCourseState(courseId));
      return;
    }
    setLearningState((current) => ({ ...current, lessonProgress: { ...current.lessonProgress, [selectedLesson.id]: progress } }));
  }

  function preventForwardSeek(event) {
    if (event.currentTarget.currentTime > maxWatchedSecondsRef.current + 3) {
      event.currentTarget.currentTime = maxWatchedSecondsRef.current;
    }
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
  const nextLesson = inProgressLesson
    || orderedLessons.find((lesson) => !completedLessonIds.has(lesson.id) && !lockedLessonIds.has(lesson.id))
    || orderedLessons.find((lesson) => !lockedLessonIds.has(lesson.id));
  const selectedLessonTest = selectedLesson?.tests?.[0] || null;

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
          {notification && (
            <div ref={notificationRef}>
              <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
            </div>
          )}
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
                  <video key={video.url} controls preload="metadata" src={video.url} onLoadedMetadata={handleVideoLoaded} onSeeking={preventForwardSeek} onTimeUpdate={handleVideoProgress}>Brauzeriniz video elementini dəstəkləmir.</video>
                )}
                {video.watermark && <span className="video-user-watermark">{video.watermark.email} · ID {video.watermark.userId}</span>}
              </div>
              {selectedLessonTest && (
                <div className="lesson-assessment-stack">
                  <section className="lesson-test-inline" aria-label="Dərs sonu testi">
                    <div><ListChecks size={23} /><span>Dərs sonu testi</span></div>
                    <h3>{selectedLessonTest.title}</h3>
                    <p>{selectedLessonTest._count?.questions || 0} sual · {selectedLessonTest.timeLimitMinutes} dəqiqə · keçid {selectedLessonTest.passScorePercent}%</p>
                    <Link className="button button-primary" to={`/tests/${selectedLessonTest.id}`}>Testə keç</Link>
                  </section>
                  <TestAudioExplanation
                    testId={selectedLessonTest.id}
                    hasAudioExplanation={selectedLessonTest.hasAudioExplanation}
                    unlocked={submittedTestIds.has(selectedLessonTest.id)}
                  />
                </div>
              )}
              {lessonResources.length > 0 && (
                <section className="lesson-test-inline" aria-label="Dərs materialları">
                  <div><FileText size={23} /><span>Dərs materialları</span></div>
                  <ul className="lesson-resource-list">
                    {lessonResources.map((resource) => (
                      <li key={resource.id}>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.title}</a>
                        {resource.description && <p>{resource.description}</p>}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </section>
          )}
          <div className="content-card-heading"><BookOpen size={25} /><div><h2>Kurs proqramı</h2><p>Modullar və yayımlanmış dərslər.</p></div></div>
          {course.modules.map((module) => (
            <article className="course-public-module" key={module.id}>
              <h3><Layers3 size={19} /> {module.order}. {module.title}</h3>
              {module.description && <p>{module.description}</p>}
              <ul>{module.lessons.map((lesson) => {
                const completed = completedLessonIds.has(lesson.id);
                const locked = learningState.enrolled && !isAdmin && lockedLessonIds.has(lesson.id);
                const watchedPercentage = learningState.lessonProgress?.[lesson.id]?.watchedPercentage || 0;
                const lessonStatus = locked ? "Kilidlidir" : completed ? "Tamamlandı" : watchedPercentage > 0 ? `Davam edir · ${watchedPercentage}%` : "Başlanmayıb";
                const lessonTest = lesson.tests?.[0];
                return (
                  <li key={lesson.id} className={`${completed && !locked ? "course-lesson-completed" : ""} ${locked ? "course-lesson-locked" : ""}`}>
                    <button type="button" className="course-lesson-open" onClick={() => handleOpenLesson(lesson)} disabled={isLoadingVideo || locked}>
                      {locked || !lesson.hasVideo ? <LockKeyhole size={17} /> : <PlayCircle size={17} />}
                      <span>{lesson.order}. {lesson.title}</span>
                    </button>
                    {lesson.durationSeconds && <small><Clock3 size={14} /> {Math.ceil(lesson.durationSeconds / 60)} dəq.</small>}
                    {learningState.enrolled && !isAdmin && (completed && !locked ? (
                      <span className="course-lesson-status is-complete"><CheckCircle2 size={15} aria-hidden="true" /> Tamamlandı</span>
                    ) : (
                      <span className={`course-lesson-status ${locked ? "is-locked" : watchedPercentage > 0 ? "is-progress" : ""}`}>
                        {lessonStatus}
                      </span>
                    ))}
                    {learningState.enrolled && !isAdmin && completed && !locked && lessonTest && (
                      <Link className="course-lesson-test" to={`/tests/${lessonTest.id}`}>
                        <ListChecks size={17} /> Dərs testi
                      </Link>
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
