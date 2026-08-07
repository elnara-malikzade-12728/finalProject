import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import JobCard from "../components/common/JobCard.jsx";
import { careers } from "../data/careers.js";
import { jobCategories, jobs } from "../data/jobs.js";

function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCareerId = searchParams.get("career") || "";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("Hamısı");
  const [selectedType, setSelectedType] = useState("Hamısı");
  const [selectedCareerId, setSelectedCareerId] =
    useState(initialCareerId);

  const filteredJobs = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLocaleLowerCase("az");

    return jobs.filter((job) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          job.title,
          job.company,
          job.location,
          job.category,
          job.description,
        ]
          .join(" ")
          .toLocaleLowerCase("az")
          .includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "Hamısı" ||
        job.category === selectedCategory;

      const matchesType =
        selectedType === "Hamısı" ||
        (selectedType === "Təcrübə"
          ? job.isInternship
          : !job.isInternship);

      const matchesCareer =
        !selectedCareerId ||
        job.careerId === selectedCareerId;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesCareer
      );
    });
  }, [
    searchTerm,
    selectedCategory,
    selectedType,
    selectedCareerId,
  ]);

  function handleCareerChange(event) {
    const careerId = event.target.value;

    setSelectedCareerId(careerId);

    if (careerId) {
      setSearchParams({ career: careerId });
    } else {
      setSearchParams({});
    }
  }

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory("Hamısı");
    setSelectedType("Hamısı");
    setSelectedCareerId("");
    setSearchParams({});
  }

  const hasActiveFilters =
    searchTerm ||
    selectedCategory !== "Hamısı" ||
    selectedType !== "Hamısı" ||
    selectedCareerId;

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-content">
          <span className="eyebrow">
            <BriefcaseBusiness size={17} aria-hidden="true" />
            Karyera imkanları
          </span>

          <h1>İş və təcrübə imkanlarını kəşf et</h1>

          <p>
            Bacarıqlarına və seçdiyin peşə istiqamətinə uyğun
            elanları araşdır.
          </p>
        </div>
      </section>

      <section className="section jobs-section">
        <div className="container">
          <div className="job-filter-panel">
            <div className="search-field">
              <Search size={20} aria-hidden="true" />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Vakansiya, şirkət və ya şəhər axtar..."
                aria-label="Vakansiya axtar"
              />
            </div>

            <div className="select-field">
              <label htmlFor="career-filter">Peşə</label>

              <select
                id="career-filter"
                value={selectedCareerId}
                onChange={handleCareerChange}
              >
                <option value="">Bütün peşələr</option>

                {careers.map((career) => (
                  <option key={career.id} value={career.id}>
                    {career.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="select-field">
              <label htmlFor="type-filter">Elan növü</label>

              <select
                id="type-filter"
                value={selectedType}
                onChange={(event) =>
                  setSelectedType(event.target.value)
                }
              >
                <option value="Hamısı">Bütün elanlar</option>
                <option value="İş">Vakansiyalar</option>
                <option value="Təcrübə">
                  Təcrübə proqramları
                </option>
              </select>
            </div>
          </div>

          <div
            className="category-filters job-category-filters"
            aria-label="Vakansiya kateqoriyaları"
          >
            <SlidersHorizontal size={19} aria-hidden="true" />

            {jobCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  selectedCategory === category
                    ? "filter-button filter-button-active"
                    : "filter-button"
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="results-heading">
            <div>
              <h2>Mövcud imkanlar</h2>
              <p>{filteredJobs.length} elan tapıldı</p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="text-button"
                onClick={clearFilters}
              >
                Filtrləri təmizlə
              </button>
            )}
          </div>

          {filteredJobs.length > 0 ? (
            <div className="jobs-list">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <BriefcaseBusiness size={44} aria-hidden="true" />
              <h2>Uyğun elan tapılmadı</h2>
              <p>
                Axtarış və filtr seçimlərini dəyişərək yenidən
                yoxlayın.
              </p>

              <button
                type="button"
                className="button button-primary"
                onClick={clearFilters}
              >
                Filtrləri təmizlə
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default JobsPage;