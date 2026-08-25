import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Save,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  createJob,
  updateJob,
} from "../api/adminJobsApi.js";
import { getCareers } from "../api/careersApi.js";
import {
  getApiErrorMessage,
} from "../api/client.js";
import { getJobById } from "../api/jobsApi.js";
import ErrorState from "../components/common/ErrorState.jsx";
import Notification from "../components/common/Notification.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

const initialForm = {
  title: "",
  company: "",
  location: "",
  description: "",
  url: "",
  careerId: "",
};

function AdminJobFormPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const isEditing = Boolean(jobId);

  const [form, setForm] = useState(initialForm);
  const [careers, setCareers] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loadError, setLoadError] = useState("");
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const pageTitle = useMemo(
    () =>
      isEditing
        ? "Vakansiyanı redaktə et"
        : "Yeni vakansiya yarat",
    [isEditing],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadPageData() {
      setIsLoading(true);
      setLoadError("");

      try {
        const careersResponse = await getCareers({
          signal: controller.signal,
        });

        setCareers(
          Array.isArray(careersResponse)
            ? careersResponse
            : [],
        );

        if (isEditing) {
          const job = await getJobById(
            Number(jobId),
            { signal: controller.signal },
          );

          setForm({
            title: job.title || "",
            company: job.company || "",
            location: job.location || "",
            description: job.description || "",
            url: job.url || "",
            careerId: String(job.careerId || ""),
          });
        }
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setLoadError(
            getApiErrorMessage(requestError),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadPageData();

    return () => controller.abort();
  }, [isEditing, jobId]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));

    setNotification(null);
  }

  function validateForm() {
    const errors = {};

    if (!form.title.trim()) {
      errors.title =
        "Vakansiya adı daxil edilməlidir.";
    }

    if (!form.careerId) {
      errors.careerId = "Kurs seçilməlidir.";
    }

    if (
      form.url.trim() &&
      !/^https?:\/\/\S+$/i.test(form.url.trim())
    ) {
      errors.url =
        "Keçid http:// və ya https:// ilə başlamalıdır.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      setNotification({
        type: "error",
        message:
          "Zəhmət olmasa, formdakı xətaları düzəldin.",
      });

      return;
    }

    setIsSaving(true);
    setNotification(null);

    const payload = {
      title: form.title.trim(),
      company: form.company.trim() || null,
      location: form.location.trim() || null,
      description:
        form.description.trim() || null,
      url: form.url.trim() || null,
      careerId: Number(form.careerId),
    };

    try {
      if (isEditing) {
        await updateJob(Number(jobId), payload);
      } else {
        await createJob(payload);
      }

      navigate("/admin/jobs", {
        replace: true,
        state: {
          successMessage: isEditing
            ? "Vakansiya uğurla yeniləndi."
            : "Vakansiya uğurla yaradıldı.",
        },
      });
    } catch (requestError) {
      setNotification({
        type: "error",
        message: getApiErrorMessage(requestError),
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <PageLoader message="Form hazırlanır..." />
    );
  }

  if (loadError) {
    return (
      <ErrorState
        title="Formu açmaq mümkün olmadı"
        message={loadError}
      />
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">
            Vakansiya idarəetməsi
          </span>

          <h1>{pageTitle}</h1>

          <p>
            Vakansiya haqqında əsas məlumatları
            daxil edin.
          </p>
        </div>

        <Link
          className="button button-secondary"
          to="/admin/jobs"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Siyahıya qayıt
        </Link>
      </div>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <form
        className="admin-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="admin-form-heading">
          <span className="admin-form-icon">
            <BriefcaseBusiness
              size={22}
              aria-hidden="true"
            />
          </span>

          <div>
            <h2>Vakansiya məlumatları</h2>
            <p>
              Ulduzla işarələnmiş sahələr
              məcburidir.
            </p>
          </div>
        </div>

        <div className="admin-form-grid">
          <div className="form-group">
            <label htmlFor="job-title">
              Vakansiya adı *
            </label>

            <input
              id="job-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Məsələn: Junior Frontend Developer"
              aria-invalid={Boolean(fieldErrors.title)}
              aria-describedby={
                fieldErrors.title
                  ? "job-title-error"
                  : undefined
              }
            />

            {fieldErrors.title && (
              <span
                id="job-title-error"
                className="form-error"
              >
                {fieldErrors.title}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="job-career">
              Kurs *
            </label>

            <select
              id="job-career"
              name="careerId"
              value={form.careerId}
              onChange={handleChange}
              aria-invalid={Boolean(
                fieldErrors.careerId,
              )}
            >
              <option value="">
                Kurs seçin
              </option>

              {careers.map((career) => (
                <option
                  key={career.id}
                  value={career.id}
                >
                  {career.title}
                </option>
              ))}
            </select>

            {fieldErrors.careerId && (
              <span className="form-error">
                {fieldErrors.careerId}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="job-company">
              Şirkət
            </label>

            <input
              id="job-company"
              name="company"
              type="text"
              value={form.company}
              onChange={handleChange}
              placeholder="Şirkətin adı"
            />
          </div>

          <div className="form-group">
            <label htmlFor="job-location">
              Məkan
            </label>

            <input
              id="job-location"
              name="location"
              type="text"
              value={form.location}
              onChange={handleChange}
              placeholder="Bakı və ya Remote"
            />
          </div>

          <div className="form-group admin-form-full">
            <label htmlFor="job-url">
              Müraciət keçidi
            </label>

            <input
              id="job-url"
              name="url"
              type="url"
              value={form.url}
              onChange={handleChange}
              placeholder="https://example.com/apply"
              aria-invalid={Boolean(fieldErrors.url)}
            />

            {fieldErrors.url && (
              <span className="form-error">
                {fieldErrors.url}
              </span>
            )}
          </div>

          <div className="form-group admin-form-full">
            <label htmlFor="job-description">
              Təsvir
            </label>

            <textarea
              id="job-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="7"
              placeholder="Vakansiyanın vəzifə və tələblərini yazın..."
            />
          </div>
        </div>

        <div className="admin-form-actions">
          <Link
            className="button button-secondary"
            to="/admin/jobs"
          >
            Ləğv et
          </Link>

          <button
            className="button button-primary"
            type="submit"
            disabled={isSaving}
          >
            <Save size={18} aria-hidden="true" />

            {isSaving
              ? "Yadda saxlanılır..."
              : isEditing
                ? "Dəyişiklikləri saxla"
                : "Vakansiya yarat"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AdminJobFormPage;
