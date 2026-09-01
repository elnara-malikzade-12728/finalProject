import { useCallback, useEffect, useState } from "react";
import { Check, ShoppingCart, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPlans } from "../api/plansApi.js";
import { createCheckout } from "../api/paymentsApi.js";
import { getPublishedCourses } from "../api/coursesApi.js";
import { getApiErrorMessage } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import Notification from "../components/common/Notification.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

const BILLING_LABELS = {
  MONTHLY: "/ ay",
  YEARLY: "/ il",
  ONE_TIME: "/ tək ödəniş",
};

function PricingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [plans, setPlans] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [isBuyingCourse, setIsBuyingCourse] = useState(false);

  const loadData = useCallback(async (signal) => {
    setIsLoading(true);
    setError("");

    try {
      const [plansResponse, coursesResponse] = await Promise.all([
        getPlans({ signal }),
        getPublishedCourses({ signal }),
      ]);

      setPlans(Array.isArray(plansResponse) ? plansResponse.filter((p) => p.active) : []);

      const courseList = Array.isArray(coursesResponse)
        ? coursesResponse
        : coursesResponse?.courses || [];
      setCourses(courseList);

      if (courseList.length > 0) {
        const requestedCourse = courseList.find((course) => course.id === Number(location.state?.courseId));
        setSelectedCourseId(String(requestedCourse?.id || courseList[0].id));
      }
    } catch (requestError) {
      if (requestError.name !== "AbortError") {
        setError(getApiErrorMessage(requestError));
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [location.state?.courseId]);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  async function handleSelectPlan(plan) {
    setCheckoutError("");

    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/pricing" } });
      return;
    }

    setLoadingPlanId(plan.id);

    try {
      const { url } = await createCheckout({ planId: plan.id });
      window.location.href = url;
    } catch (requestError) {
      setCheckoutError(getApiErrorMessage(requestError));
      setLoadingPlanId(null);
    }
  }

  async function handleBuyCourse() {
    setCheckoutError("");

    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/pricing" } });
      return;
    }

    if (!selectedCourseId) {
      setCheckoutError("Zəhmət olmasa, kurs seçin.");
      return;
    }

    setIsBuyingCourse(true);

    try {
      const { url } = await createCheckout({ courseId: Number(selectedCourseId) });
      window.location.href = url;
    } catch (requestError) {
      setCheckoutError(getApiErrorMessage(requestError));
      setIsBuyingCourse(false);
    }
  }

  if (isLoading) {
    return <PageLoader message="Planlar yüklənir..." fullPage />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => loadData()}
      />
    );
  }

  const displayPlans = plans.filter((plan) => plan.billingPeriod !== "ONE_TIME");
  const hasSingleCoursePlan = plans.some((plan) => plan.billingPeriod === "ONE_TIME");

  return (
    <section className="pricing-page">
      <header className="pricing-header">
        <h1>Qiymət planları</h1>
        <p>Sizə uyğun planı seçin və biliklərinizi növbəti səviyyəyə daşıyın.</p>
      </header>

      {checkoutError && (
        <Notification
          type="error"
          message={checkoutError}
          onClose={() => setCheckoutError("")}
        />
      )}

      {displayPlans.length === 0 ? (
        <p className="pricing-empty">Hazırda aktiv plan tapılmadı.</p>
      ) : (
        <div className="pricing-grid">
          {displayPlans.map((plan) => {
            const isFree = Number(plan.price) === 0;
            const isYearly = plan.billingPeriod === "YEARLY";

            return (
              <article
                key={plan.id}
                className={`pricing-card${isYearly ? " pricing-card-highlight" : ""}`}
              >
                {isYearly && (
                  <span className="pricing-badge">
                    <Sparkles size={14} aria-hidden="true" />
                    Ən sərfəli
                  </span>
                )}

                <h2>{plan.name}</h2>

                <p className="pricing-price">
                  {isFree ? "Pulsuz" : `${plan.price} ${plan.currency}`}
                  {!isFree && (
                    <span className="pricing-period">
                      {BILLING_LABELS[plan.billingPeriod] || ""}
                    </span>
                  )}
                </p>

                {plan.description && (
                  <p className="pricing-description">{plan.description}</p>
                )}

                <button
                  type="button"
                  className="button button-primary pricing-button"
                  onClick={() => handleSelectPlan(plan)}
                  disabled={loadingPlanId === plan.id || isFree}
                >
                  {isFree
                    ? "Cari plan"
                    : loadingPlanId === plan.id
                      ? "Yönləndirilir..."
                      : "Planı seç"}
                </button>
              </article>
            );
          })}

          <article className="pricing-card">
            <h2>Korporativ</h2>
            <p className="pricing-price">Fərdi təklif</p>
            <p className="pricing-description">
              Komandanız üçün toplu təlim paketi. Bizimlə əlaqə saxlayın.
            </p>
            <button
              type="button"
              className="button button-secondary pricing-button"
              onClick={() => navigate("/corporate")}
            >
              <Check size={16} aria-hidden="true" />
              Ətraflı məlumat
            </button>
          </article>
        </div>
      )}

      {hasSingleCoursePlan && courses.length > 0 && (
        <section className="pricing-single-course">
          <header>
            <h2>Tək kurs al</h2>
            <p>Abunəlik istəmirsinizsə, konkret bir kursu birdəfəlik ala bilərsiniz.</p>
          </header>

          <div className="pricing-single-course-form">
            <select
              value={selectedCourseId}
              onChange={(event) => setSelectedCourseId(event.target.value)}
              disabled={isBuyingCourse}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="button button-primary"
              onClick={handleBuyCourse}
              disabled={isBuyingCourse}
            >
              <ShoppingCart size={16} aria-hidden="true" />
              {isBuyingCourse ? "Yönləndirilir..." : "Kursu al"}
            </button>
          </div>
        </section>
      )}
    </section>
  );
}

export default PricingPage;
