import { useCallback, useEffect, useRef, useState } from "react";
import {
  Newspaper,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import {
  createArticle,
  deleteArticle,
  getArticles,
  updateArticle,
} from "../api/articlesApi.js";
import { getApiErrorMessage } from "../api/client.js";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import Notification from "../components/common/Notification.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

const emptyForm = {
  id: null,
  title: "",
  slug: "",
  summary: "",
  content: "",
  published: false,
};

function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const notificationRef = useRef(null);

  const loadArticles = useCallback(async (signal) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getArticles({ signal });
      setArticles(Array.isArray(response) ? response : response?.articles || []);
    } catch (requestError) {
      if (requestError.name !== "AbortError") {
        setError(getApiErrorMessage(requestError));
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

  useEffect(() => {
    if (notification) {
      notificationRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [notification]);

  function openCreateForm() {
    setForm(emptyForm);
    setIsFormOpen(true);
  }

  function openEditForm(article) {
    setForm({
      id: article.id,
      title: article.title || "",
      slug: article.slug || "",
      summary: article.summary || "",
      content: article.content || "",
      published: Boolean(article.published),
    });
    setIsFormOpen(true);
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotification(null);
    setSavingId(form.id || "new");

    const payload = {
      title: form.title,
      slug: form.slug,
      summary: form.summary || undefined,
      content: form.content,
      published: form.published,
    };

    try {
      if (form.id) {
        const updated = await updateArticle(form.id, payload);
        setArticles((current) =>
          current.map((article) => (article.id === form.id ? updated : article)),
        );
        setNotification({ type: "success", message: "Məqalə yeniləndi." });
      } else {
        const created = await createArticle(payload);
        setArticles((current) => [...current, created]);
        setNotification({ type: "success", message: "Məqalə yaradıldı." });
      }
      setIsFormOpen(false);
      setForm(emptyForm);
    } catch (requestError) {
      setNotification({ type: "error", message: getApiErrorMessage(requestError) });
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(article) {
    if (!window.confirm(`"${article.title}" məqaləsini silmək istədiyinizə əminsiniz?`)) {
      return;
    }

    setDeletingId(article.id);
    setNotification(null);

    try {
      await deleteArticle(article.id);
      setArticles((current) => current.filter((item) => item.id !== article.id));
      setNotification({ type: "success", message: "Məqalə silindi." });
    } catch (requestError) {
      setNotification({ type: "error", message: getApiErrorMessage(requestError) });
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return <PageLoader message="Məqalələr yüklənir..." />;
  }

  if (error) {
    return (
      <ErrorState title="Məqalələri yükləmək mümkün olmadı" message={error} onRetry={() => loadArticles()} />
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">İdarəetmə paneli</span>
          <h1>Məqalələr</h1>
          <p>Bloq məqalələrini yaradın, redaktə edin və dərc edin.</p>
        </div>

        <button type="button" className="button button-primary" onClick={openCreateForm}>
          <Plus size={18} aria-hidden="true" />
          Yeni məqalə
        </button>
      </div>

      {notification && (
        <div ref={notificationRef}>
          <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
        </div>
      )}

      {isFormOpen && (
        <form className="form admin-inline-form" onSubmit={handleSubmit}>
          <div className="admin-inline-form-header">
            <h2>{form.id ? "Məqaləni redaktə et" : "Yeni məqalə"}</h2>
            <button type="button" className="admin-icon-button" onClick={() => setIsFormOpen(false)} aria-label="Bağla">
              <X size={17} aria-hidden="true" />
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="title">Başlıq *</label>
            <input id="title" name="title" type="text" value={form.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="slug">Slug *</label>
            <input id="slug" name="slug" type="text" value={form.slug} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="summary">Qısa təsvir</label>
            <textarea id="summary" name="summary" rows={2} value={form.summary} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="content">Məzmun *</label>
            <textarea id="content" name="content" rows={8} value={form.content} onChange={handleChange} required />
          </div>

          <div className="form-group form-checkbox">
            <label htmlFor="published">
              <input id="published" name="published" type="checkbox" checked={form.published} onChange={handleChange} />
              Dərc edilsin
            </label>
          </div>

          <button type="submit" className="button button-primary" disabled={savingId !== null}>
            {savingId !== null ? "Yadda saxlanılır..." : "Yadda saxla"}
          </button>
        </form>
      )}

      {articles.length === 0 ? (
        <EmptyState icon={Newspaper} title="Məqalə yoxdur" message="İlk məqaləni yaradaraq siyahını formalaşdırın." />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Başlıq</th>
                <th>Slug</th>
                <th>Status</th>
                <th className="admin-table-actions-heading">Əməliyyatlar</th>
              </tr>
            </thead>

            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td>{article.title}</td>
                  <td>{article.slug}</td>
                  <td>{article.published ? "Dərc edilib" : "Qaralama"}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-icon-button" type="button" onClick={() => openEditForm(article)} aria-label={`${article.title} redaktə et`} title="Redaktə et">
                        <Pencil size={17} aria-hidden="true" />
                      </button>

                      <button
                        className="admin-icon-button admin-icon-button-danger"
                        type="button"
                        disabled={deletingId === article.id}
                        onClick={() => handleDelete(article)}
                        aria-label={`${article.title} sil`}
                        title="Sil"
                      >
                        {deletingId === article.id ? (
                          <RefreshCw className="loading-spinner" size={17} aria-hidden="true" />
                        ) : (
                          <Trash2 size={17} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminArticlesPage;
