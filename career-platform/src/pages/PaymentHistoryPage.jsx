import { useCallback, useEffect, useState } from "react";
import {
  Banknote,
  CalendarDays,
  CreditCard,
  Hash,
} from "lucide-react";
import { getMyPayments } from "../api/paymentsApi.js";
import { getApiErrorMessage } from "../api/client.js";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

const statusLabels = {
  PENDING: "Gözləmədə",
  SUCCEEDED: "Uğurlu",
  FAILED: "Uğursuz",
  REFUNDED: "Geri qaytarılıb",
};

function getStatusLabel(status) {
  return statusLabels[status] || status || "Naməlum";
}

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

function getPaymentDescription(payment) {
  if (payment.subscription?.plan?.name) {
    return payment.subscription.plan.name;
  }

  if (payment.subscriptionId) {
    return "Abunəlik ödənişi";
  }

  if (payment.coursePurchase?.course?.title) {
    return payment.coursePurchase.course.title;
  }

  if (payment.coursePurchaseId) {
    return "Kurs alışı";
  }

  return "Ödəniş";
}

function PaymentHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayments = useCallback(async (signal) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getMyPayments({ signal });

      const paymentList = Array.isArray(response)
        ? response
        : response?.payments || [];

      setPayments(paymentList);
    } catch (requestError) {
      if (requestError.name !== "AbortError") {
        setError(getApiErrorMessage(requestError));
        setPayments([]);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    loadPayments(controller.signal);

    return () => controller.abort();
  }, [loadPayments]);

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-content">
          <span className="eyebrow">
            <CreditCard size={17} aria-hidden="true" />
            Şəxsi kabinet
          </span>

          <h1>Ödəniş tarixçəsi</h1>

          <p>Bütün ödənişlərinizin siyahısını buradan izləyin.</p>
        </div>
      </section>

      <section className="section jobs-section">
        <div className="container">
          <div className="results-heading">
            <div>
              <h2>Ödənişlər</h2>
              <p>
                {isLoading
                  ? "Ödənişlər yüklənir..."
                  : `${payments.length} ödəniş`}
              </p>
            </div>
          </div>

          {isLoading ? (
            <PageLoader message="Ödənişlər yüklənir..." />
          ) : error ? (
            <ErrorState
              title="Ödəniş tarixçəsini yükləmək mümkün olmadı"
              message={error}
              onRetry={() => loadPayments()}
            />
          ) : payments.length === 0 ? (
            <EmptyState
              icon={Banknote}
              title="Ödəniş tapılmadı"
              message="Hələ heç bir ödəniş etməmisiniz."
            />
          ) : (
            <div className="jobs-list">
              {payments.map((payment) => (
                <article key={payment.id} className="job-card">
                  <div className="job-card-main">
                    <div className="job-card-content">
                      <div className="job-card-heading">
                        <div>
                          <div className="job-tags">
                            <span className="tag">
                              {getStatusLabel(payment.status)}
                            </span>
                          </div>

                          <h3>{getPaymentDescription(payment)}</h3>

                          <p className="company-name">
                            {payment.amount} {payment.currency}
                          </p>
                        </div>
                      </div>

                      <div className="job-meta">
                        <span>
                          <CalendarDays size={16} aria-hidden="true" />
                          {formatDate(payment.createdAt)}
                        </span>

                        <span>
                          <Hash size={16} aria-hidden="true" />
                          {payment.providerReference}
                        </span>
                      </div>
                    </div>
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

export default PaymentHistoryPage;