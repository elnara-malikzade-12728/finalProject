import { useCallback, useEffect, useRef, useState } from "react";
import {
  CreditCard,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import {
  createPlan,
  deletePlan,
  getPlans,
  updatePlan,
} from "../api/plansApi.js";
import { getApiErrorMessage } from "../api/client.js";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import Notification from "../components/common/Notification.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

const emptyForm = {
  id: null,
  name: "",
  code: "",
  description: "",
  price: "",
  currency: "AZN",
  billingPeriod: "MONTHLY",
  active: true,
};

function AdminPlansPage() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const notificationRef = useRef(null);

  const loadPlans = useCallback(async (signal) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getPlans({ signal });
      setPlans(Array.isArray(response) ? response : response?.plans || []);
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
    loadPlans(controller.signal);
    return () => controller.abort();
  }, [loadPlans]);

  useEffect(() => {
    if (notification) {
      notificationRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [notification]);

  function openCreateForm() {
    setForm(emptyForm);
    setIsFormOpen(true);
  }

  function openEditForm(plan) {
    setForm({
      id: plan.id,
      name: plan.name || "",
      code: plan.code || "",
      description: plan.description || "",
      price: plan.price ?? "",
      currency: plan.currency || "AZN",
      billingPeriod: plan.billingPeriod || "MONTHLY",
      active: Boolean(plan.active),
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
      name: form.name,
      code: form.code,
      description: form.description || undefined,
      price: Number(form.price),
      currency: form.currency,
      billingPeriod: form.billingPeriod,
      active: form.active,
    };

    try {
      if (form.id) {
        const updated = await updatePlan(form.id, payload);
        setPlans((current) =>
          current.map((plan) => (plan.id === form.id ? updated : plan)),
        );
        setNotification({ type: "success", message: "Plan yeniləndi." });
      } else {
        const created = await createPlan(payload);
        setPlans((current) => [...current, created]);
        setNotification({ type: "success", message: "Plan yaradıldı." });
      }
      setIsFormOpen(false);
      setForm(emptyForm);
    } catch (requestError) {
      setNotification({ type: "error", message: getApiErrorMessage(requestError) });
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(plan) {
    if (!window.confirm(`"${plan.name}" planını deaktiv etmək istədiyinizə əminsiniz?`)) {
      return;
    }

    setDeletingId(plan.id);
    setNotification(null);

    try {
      await deletePlan(plan.id);
      await loadPlans();
      setNotification({ type: "success", message: "Plan deaktiv edildi." });
    } catch (requestError) {
      setNotification({ type: "error", message: getApiErrorMessage(requestError) });
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return <PageLoader message="Planlar yüklənir..." />;
  }

  if (error) {
    return (
      <ErrorState title="Planları yükləmək mümkün olmadı" message={error} onRetry={() => loadPlans()} />
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">İdarəetmə paneli</span>
          <h1>Planlar</h1>
          <p>Abunəlik planlarını yaradın, yeniləyin və deaktiv edin.</p>
        </div>

        <button type="button" className="button button-primary" onClick={openCreateForm}>
          <Plus size={18} aria-hidden="true" />
          Yeni plan
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
            <h2>{form.id ? "Planı redaktə et" : "Yeni plan"}</h2>
            <button type="button" className="admin-icon-button" onClick={() => setIsFormOpen(false)} aria-label="Bağla">
              <X size={17} aria-hidden="true" />
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="name">Ad *</label>
            <input id="name" name="name" type="text" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="code">Kod *</label>
            <input id="code" name="code" type="text" value={form.code} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="description">Təsvir</label>
            <textarea id="description" name="description" rows={3} value={form.description} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="price">Qiymət *</label>
            <input id="price" name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="currency">Valyuta</label>
            <input id="currency" name="currency" type="text" value={form.currency} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="billingPeriod">Ödəniş dövrü</label>
            <select id="billingPeriod" name="billingPeriod" value={form.billingPeriod} onChange={handleChange}>
              <option value="MONTHLY">Aylıq</option>
              <option value="YEARLY">İllik</option>
              <option value="ONE_TIME">Birdəfəlik</option>
            </select>
          </div>

          <div className="form-group form-checkbox">
            <label htmlFor="active">
              <input id="active" name="active" type="checkbox" checked={form.active} onChange={handleChange} />
              Aktiv
            </label>
          </div>

          <button type="submit" className="button button-primary" disabled={savingId !== null}>
            {savingId !== null ? "Yadda saxlanılır..." : "Yadda saxla"}
          </button>
        </form>
      )}

      {plans.length === 0 ? (
        <EmptyState icon={CreditCard} title="Plan yoxdur" message="İlk planı yaradaraq siyahını formalaşdırın." />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ad</th>
                <th>Kod</th>
                <th>Qiymət</th>
                <th>Dövr</th>
                <th>Status</th>
                <th className="admin-table-actions-heading">Əməliyyatlar</th>
              </tr>
            </thead>

            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td>{plan.name}</td>
                  <td>{plan.code}</td>
                  <td>{plan.price} {plan.currency}</td>
                  <td>{plan.billingPeriod}</td>
                  <td>{plan.active ? "Aktiv" : "Deaktiv"}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-icon-button" type="button" onClick={() => openEditForm(plan)} aria-label={`${plan.name} planını redaktə et`} title="Redaktə et">
                        <Pencil size={17} aria-hidden="true" />
                      </button>

                      <button
                        className="admin-icon-button admin-icon-button-danger"
                        type="button"
                        disabled={deletingId === plan.id || !plan.active}
                        onClick={() => handleDelete(plan)}
                        aria-label={`${plan.name} planını deaktiv et`}
                        title="Deaktiv et"
                      >
                        {deletingId === plan.id ? (
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

export default AdminPlansPage;
