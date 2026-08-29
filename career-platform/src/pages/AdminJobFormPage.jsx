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
import { getPublishedCourses } from "../api/coursesApi.js";
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
  courseId: "",
  employmentType: "FULL_TIME",
  experienceLevel: "",
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "AZN",
  companyLogoUrl: "",
};

function AdminJobFormPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const isEditing = Boolean(jobId);

  const [form, setForm] = useState(initialForm);
  const [courses, setCourses] = useState([]);
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
        const coursesResponse = await getPublishedCourses({
          signal: controller.signal,
        });

        setCourses(
          Array.isArray(coursesResponse)
            ? coursesResponse
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
            courseId: String(job.courseId || ""),
            employmentType: job.employmentType || "FULL_TIME",
            experienceLevel: job.experienceLevel || "",
            salaryMin: job.salaryMin ?? "",
            salaryMax: job.salaryMax ?? "",
            salaryCurrency: job.salaryCurrency || "AZN",
            companyLogoUrl: job.companyLogoUrl || "",
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

    if (!form.courseId) {
      errors.courseId = "Kurs seçilməlidir.";
    }

    if (
      form.url.trim() &&
      !/^https?:\/\/\S+$/i.test(form.url.trim())
    ) {
      errors.url =
        "Keçid http:// və ya https:// ilə başlamalıdır.";
    }

    if (form.companyLogoUrl.trim() && !/^https?:\/\/\S+$/i.test(form.companyLogoUrl.trim())) {
      errors.companyLogoUrl = "Loqo keçidi http:// və ya https:// ilə başlamalıdır.";
    }

    if (form.salaryMin && form.salaryMax && Number(form.salaryMin) > Number(form.salaryMax)) {
      errors.salaryMax = "Maksimum maaş minimum maaşdan az ola bilməz.";
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
      courseId: Number(form.courseId),
      careerId: null,
      employmentType: form.employmentType,
      experienceLevel: form.experienceLevel || null,
      salaryMin: form.salaryMin === "" ? null : Number(form.salaryMin),
      salaryMax: form.salaryMax === "" ? null : Number(form.salaryMax),
      salaryCurrency: form.salaryCurrency.trim().toUpperCase() || "AZN",
      companyLogoUrl: form.companyLogoUrl.trim() || null,
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
              name="courseId"
              value={form.courseId}
              onChange={handleChange}
              aria-invalid={Boolean(
                fieldErrors.courseId,
              )}
            >
              <option value="">
                Kurs seçin
              </option>

              {courses.map((course) => (
                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.title}
                </option>
              ))}
            </select>

            {fieldErrors.courseId && (
              <span className="form-error">
                {fieldErrors.courseId}
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

          <div className="form-group">
            <label htmlFor="job-employment-type">İş növü *</label>
            <select id="job-employment-type" name="employmentType" value={form.employmentType} onChange={handleChange}>
              <option value="FULL_TIME">Tam ştat</option>
              <option value="PART_TIME">Yarım ştat</option>
              <option value="INTERNSHIP">Təcrübə proqramı</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="job-experience-level">Təcrübə səviyyəsi</label>
            <select id="job-experience-level" name="experienceLevel" value={form.experienceLevel} onChange={handleChange}>
              <option value="">Qeyd edilməyib</option>
              <option value="ENTRY_LEVEL">Başlanğıc</option>
              <option value="JUNIOR">Junior</option>
              <option value="MID_LEVEL">Mid-level</option>
              <option value="SENIOR">Senior</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="job-salary-min">Minimum maaş</label>
            <input id="job-salary-min" name="salaryMin" type="number" min="0" value={form.salaryMin} onChange={handleChange} placeholder="1000" />
          </div>

          <div className="form-group">
            <label htmlFor="job-salary-max">Maksimum maaş</label>
            <input id="job-salary-max" name="salaryMax" type="number" min="0" value={form.salaryMax} onChange={handleChange} placeholder="1800" aria-invalid={Boolean(fieldErrors.salaryMax)} />
            {fieldErrors.salaryMax && <span className="form-error">{fieldErrors.salaryMax}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="job-salary-currency">Valyuta</label>
            <input id="job-salary-currency" name="salaryCurrency" maxLength="3" value={form.salaryCurrency} onChange={handleChange} placeholder="AZN" />
          </div>

          <div className="form-group">
            <label htmlFor="job-company-logo">Şirkət loqosu URL</label>
            <input id="job-company-logo" name="companyLogoUrl" type="url" value={form.companyLogoUrl} onChange={handleChange} placeholder="https://example.com/logo.png" aria-invalid={Boolean(fieldErrors.companyLogoUrl)} />
            {fieldErrors.companyLogoUrl && <span className="form-error">{fieldErrors.companyLogoUrl}</span>}
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
