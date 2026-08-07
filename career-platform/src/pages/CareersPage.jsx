import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import CareerCard from "../components/common/CareerCard.jsx";
import { careers } from "../data/careers.js";

const categories = [
  "Hamısı",
  ...new Set(careers.map((career) => career.category)),
];

function CareersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("Hamısı");

  const filteredCareers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("az");

    return careers.filter((career) => {
      const matchesCategory =
        selectedCategory === "Hamısı" ||
        career.category === selectedCategory;

      const searchableText = [
        career.title,
        career.category,
        career.shortDescription,
        ...career.skills,
      ]
        .join(" ")
        .toLocaleLowerCase("az");

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory("Hamısı");
  }

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-content">
          <span className="eyebrow">Karyera istiqamətləri</span>
          <h1>Gələcəyinə uyğun peşəni tap</h1>
          <p>
            Peşələri araşdır, tələb olunan bacarıqları öyrən və
            addım-addım inkişaf yoluna başla.
          </p>
        </div>
      </section>

      <section className="section careers-section">
        <div className="container">
          <div className="filter-panel">
            <div className="search-field">
              <Search size={20} aria-hidden="true" />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Peşə və ya bacarıq axtar..."
                aria-label="Peşə və ya bacarıq axtar"
              />
            </div>

            <div
              className="category-filters"
              aria-label="Peşə kateqoriyaları"
            >
              <SlidersHorizontal size={19} aria-hidden="true" />

              {categories.map((category) => (
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
          </div>

          <div className="results-heading">
            <div>
              <h2>Peşələr</h2>
              <p>
                {filteredCareers.length} istiqamət tapıldı
              </p>
            </div>
          </div>

          {filteredCareers.length > 0 ? (
            <div className="card-grid">
              {filteredCareers.map((career) => (
                <CareerCard key={career.id} career={career} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={42} aria-hidden="true" />
              <h2>Nəticə tapılmadı</h2>
              <p>
                Axtarış sözünü və ya seçdiyiniz kateqoriyanı
                dəyişdirməyə çalışın.
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

export default CareersPage;