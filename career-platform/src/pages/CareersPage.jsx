import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { getApiErrorMessage } from "../api/client.js";
import { getPublishedCourses } from "../api/coursesApi.js";
import CareerCard from "../components/common/CareerCard.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

function CareersPage() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Hamısı");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getPublishedCourses({ signal: controller.signal })
      .then((response) => setCourses(Array.isArray(response) ? response : []))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(getApiErrorMessage(requestError));
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const categories = useMemo(() => [
    "Hamısı",
    ...new Set(courses.map((course) => course.category?.name || "Kateqoriyasız")),
  ], [courses]);

  const filteredCourses = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("az");
    return courses.filter((course) => {
      const category = course.category?.name || "Kateqoriyasız";
      const searchable = [course.title, course.description, category].join(" ").toLocaleLowerCase("az");
      return (selectedCategory === "Hamısı" || selectedCategory === category) && (!query || searchable.includes(query));
    });
  }, [courses, searchTerm, selectedCategory]);

  if (loading) return <PageLoader message="Kurslar yüklənir..." fullPage />;
  if (error) return <section className="section"><div className="container"><ErrorState title="Kursları yükləmək mümkün olmadı" message={error} /></div></section>;

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-content">
          <span className="eyebrow">Kurs kataloqu</span>
          <h1>Gələcəyinə uyğun kursu tap</h1>
          <p>Yayımlanmış kursları araşdır və öyrənmə yoluna başla.</p>
        </div>
      </section>
      <section className="section careers-section">
        <div className="container">
          <div className="filter-panel">
            <div className="search-field"><Search size={20} aria-hidden="true" /><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Kurs axtar..." aria-label="Kurs axtar" /></div>
            <div className="category-filters" aria-label="Kurs kateqoriyaları"><SlidersHorizontal size={19} aria-hidden="true" />{categories.map((category) => <button key={category} type="button" className={selectedCategory === category ? "filter-button filter-button-active" : "filter-button"} onClick={() => setSelectedCategory(category)}>{category}</button>)}</div>
          </div>
          <div className="results-heading"><div><h2>Kurslar</h2><p>{filteredCourses.length} kurs tapıldı</p></div></div>
          {filteredCourses.length ? <div className="card-grid">{filteredCourses.map((course) => <CareerCard key={course.id} career={course} />)}</div> : <EmptyState icon={Search} title="Nəticə tapılmadı" message="Axtarışı və ya kateqoriya filtrini dəyişin." />}
        </div>
      </section>
    </>
  );
}

export default CareersPage;
