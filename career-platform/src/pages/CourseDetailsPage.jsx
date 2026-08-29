import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Clock3, Layers3, PlayCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client.js";
import { getPublishedCourse } from "../api/coursesApi.js";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

function CourseDetailsPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getPublishedCourse(courseId, { signal: controller.signal })
      .then(setCourse)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(getApiErrorMessage(requestError));
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [courseId]);

  if (loading) return <PageLoader message="Kurs yüklənir..." fullPage />;
  if (error || !course) return <section className="section"><div className="container"><ErrorState title="Kurs tapılmadı" message={error || "Bu kurs mövcud deyil və ya yayımdan çıxarılıb."} /></div></section>;

  const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0);

  return (
    <>
      <section className="career-detail-hero">
        <div className="container">
          <Link to="/courses" className="back-link"><ArrowLeft size={18} /> Bütün kurslar</Link>
          <div className="career-detail-heading">
            <div><span className="tag">{course.category?.name || "Kateqoriyasız"}</span><h1>{course.title}</h1><p>{course.description || "Kursun dərs proqramı ilə tanış olun."}</p></div>
          </div>
          <div className="career-overview">
            <div className="career-overview-item"><Layers3 size={22} /><div><span>Modullar</span><strong>{course.modules.length}</strong></div></div>
            <div className="career-overview-item"><BookOpen size={22} /><div><span>Dərslər</span><strong>{lessonCount}</strong></div></div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container course-public-modules">
          <div className="content-card-heading"><BookOpen size={25} /><div><h2>Kurs proqramı</h2><p>Modullar və yayımlanmış dərslər.</p></div></div>
          {course.modules.map((module) => (
            <article className="course-public-module" key={module.id}>
              <h3><Layers3 size={19} /> {module.order}. {module.title}</h3>
              {module.description && <p>{module.description}</p>}
              <ul>{module.lessons.map((lesson) => <li key={lesson.id}><PlayCircle size={17} /><span>{lesson.order}. {lesson.title}</span>{lesson.durationSeconds && <small><Clock3 size={14} /> {Math.ceil(lesson.durationSeconds / 60)} dəq.</small>}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default CourseDetailsPage;
