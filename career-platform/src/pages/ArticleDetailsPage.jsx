import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Newspaper } from "lucide-react";
import { useParams } from "react-router-dom";
import { getArticleBySlug } from "../api/articlesApi.js";
import { getApiErrorMessage } from "../api/client.js";
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

function ArticleDetailsPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadArticle = useCallback(
    async (signal) => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getArticleBySlug(slug, { signal });
        setArticle(response?.article || response || null);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(getApiErrorMessage(requestError));
          setArticle(null);
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [slug],
  );

  useEffect(() => {
    const controller = new AbortController();

    loadArticle(controller.signal);

    return () => controller.abort();
  }, [loadArticle]);

  if (isLoading) {
    return <PageLoader message="Məqalə yüklənir..." fullPage />;
  }

  if (error || !article) {
    return (
      <ErrorState
        title="Məqaləni yükləmək mümkün olmadı"
        message={error || "Məqalə tapılmadı."}
        onRetry={() => loadArticle()}
      />
    );
  }

  return (
    <section className="section jobs-section">
      <div className="container article-details">
        <span className="eyebrow">
          <Newspaper size={17} aria-hidden="true" />
          Bloq
        </span>

        <h1>{article.title}</h1>

        <div className="job-meta">
          <span>
            <CalendarDays size={16} aria-hidden="true" />
            {formatDate(article.publishedAt)}
          </span>
        </div>

        {article.summary && (
          <p className="company-name">{article.summary}</p>
        )}

        <div className="article-content">
          {article.content
            ?.split("\n")
            .map((paragraph, index) =>
              paragraph.trim() ? (
                <p key={index}>{paragraph}</p>
              ) : null,
            )}
        </div>
      </div>
    </section>
  );
}

export default ArticleDetailsPage;