import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { getCareers } from "../api/careersApi.js";
import { getApiErrorMessage } from "../api/client.js";
import { getJobs } from "../api/jobsApi.js";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import JobCard from "../components/common/JobCard.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [location, setLocation] = useState(
    searchParams.get("location") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "Hamısı",
  );
  const [selectedCareerId, setSelectedCareerId] = useState(
    searchParams.get("career") || "",
  );
  const [careers, setCareers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const categoryOptions = useMemo(() => {
    const careerTitles = [
      ...new Set(
        careers
          .map((career) => career.title)
          .filter(Boolean),
      ),
    ];

    return ["Hamısı", ...careerTitles];
  }, [careers]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCareers() {
      try {
        const response = await getCareers({
          signal: controller.signal,
        });

        setCareers(Array.isArray(response) ? response : []);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setCareers([]);
        }
      }
    }

    loadCareers();

    return () => controller.abort();
  }, []);

  const loadJobs = useCallback(
    async (signal) => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getJobs(
          {
            search: searchTerm.trim(),
            location: location.trim(),
            category: selectedCategory,
            careerId: selectedCareerId,
          },
          { signal },
        );

        setJobs(Array.isArray(response) ? response : []);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(getApiErrorMessage(requestError));
          setJobs([]);
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [
      searchTerm,
      location,
      selectedCategory,
      selectedCareerId,
    ],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      loadJobs(controller.signal);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [loadJobs]);

  function updateCareerSearchParam(careerId) {
    if (careerId) {
      setSearchParams({ career: careerId });
    } else {
      setSearchParams({});
    }
  }

  function handleCareerChange(event) {
    const careerId = event.target.value;

    setSelectedCareerId(careerId);
    updateCareerSearchParam(careerId);
  }

  function clearFilters() {
    setSearchTerm("");
    setLocation("");
    setSelectedCategory("Hamısı");
    setSelectedCareerId("");
    setSearchParams({});
  }

  const hasActiveFilters =
    searchTerm ||
    location ||
    selectedCategory !== "Hamısı" ||
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
            Bacarıqlarına və seçdiyin kurs istiqamətinə uyğun
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
              <label htmlFor="career-filter">Kurs</label>

              <select
                id="career-filter"
                value={selectedCareerId}
                onChange={handleCareerChange}
              >
                <option value="">Bütün kurslar</option>

                {careers.map((career) => (
                  <option key={career.id} value={career.id}>
                    {career.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="select-field">
              <label htmlFor="location-filter">Məkan</label>

              <div className="search-field">
                <Search size={20} aria-hidden="true" />

                <input
                  id="location-filter"
                  type="search"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="Şəhər və ya məkan"
                  aria-label="Məkan axtar"
                />
              </div>
            </div>
          </div>

          <div
            className="category-filters job-category-filters"
            aria-label="Kurs kateqoriyaları"
          >
            <SlidersHorizontal size={19} aria-hidden="true" />

            {categoryOptions.map((category) => (
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
              <p>
                {isLoading
                  ? "Elanlar yüklənir..."
                  : `${jobs.length} elan tapıldı`}
              </p>
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

          {isLoading ? (
            <PageLoader message="Vakansiyalar yüklənir..." />
          ) : error ? (
            <ErrorState
              title="Vakansiyaları yükləmək mümkün olmadı"
              message={error}
              onRetry={() => loadJobs()}
            />
          ) : jobs.length > 0 ? (
            <div className="jobs-list">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BriefcaseBusiness}
              title="Uyğun elan tapılmadı"
              message="Axtarış və filtr seçimlərini dəyişərək yenidən yoxlayın."
              actionLabel={
                hasActiveFilters ? "Filtrləri təmizlə" : undefined
              }
              onAction={
                hasActiveFilters ? clearFilters : undefined
              }
            />
          )}
        </div>
      </section>
    </>
  );
}

export default JobsPage;
