import { useCallback, useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPlans } from "../api/plansApi.js";
import { createCheckout } from "../api/paymentsApi.js";
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

  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [loadingPlanId, setLoadingPlanId] = useState(null);

  const loadPlans = useCallback(async (signal) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getPlans({ signal });
      setPlans(Array.isArray(response) ? response.filter((p) => p.active) : []);
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

  async function handleSelectPlan(plan) {
    setCheckoutError("");

    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/pricing" } });
      return;
    }

    if (plan.billingPeriod === "ONE_TIME") {
      // Tək kurs planı burada birbaşa satılmır — kurs səhifəsindən alınır.
      navigate("/courses");
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

  if (isLoading) {
    return <PageLoader message="Planlar yüklənir..." fullPage />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => loadPlans()}
      />
    );
  }

  const displayPlans = plans.filter((plan) => plan.billingPeriod !== "ONE_TIME");

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
    </section>
  );
}

export default PricingPage;