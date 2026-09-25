import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";
import { getArticles } from "../api/articlesApi.js";
import { getApiErrorMessage } from "../api/client.js";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

function formatDate(date) {
  if (!date) {
    return "Tarix yoxdur";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Tarix yoxdur";
  }

  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();

  return `${day}.${month}.${year}`;
}

function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadArticles = useCallback(async (signal) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getArticles({ signal });

      const articleList = Array.isArray(response)
        ? response
        : response?.articles || [];

      setArticles(articleList);
    } catch (requestError) {
      if (requestError.name !== "AbortError") {
        setError(getApiErrorMessage(requestError));
        setArticles([]);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    loadArticles(controller.signal);

    return () => controller.abort();
  }, [loadArticles]);

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-content">
          <span className="eyebrow">
            <Newspaper size={17} aria-hidden="true" />
            Bloq
          </span>

          <h1>Məqalələr</h1>

          <p>Karyera və inkişaf mövzusunda faydalı məqalələr.</p>
        </div>
      </section>

      <section className="section jobs-section">
        <div className="container">
          {isLoading ? (
            <PageLoader message="Məqalələr yüklənir..." />
          ) : error ? (
            <ErrorState
              title="Məqalələri yükləmək mümkün olmadı"
              message={error}
              onRetry={() => loadArticles()}
            />
          ) : articles.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title="Məqalə tapılmadı"
              message="Hələ heç bir məqalə dərc edilməyib."
            />
          ) : (
            <div className="simple-card-grid article-card-grid">
              {articles.map((article) => (
                <article key={article.id} className="simple-card article-card">
                  <h3>
                    <Link to={`/articles/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h3>

                  {article.summary && <p>{article.summary}</p>}

                  <div className="article-card-date">
                    <CalendarDays size={16} aria-hidden="true" />
                    {formatDate(article.publishedAt)}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default ArticlesPage;
