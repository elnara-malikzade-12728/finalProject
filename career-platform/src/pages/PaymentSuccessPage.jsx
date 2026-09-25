import { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { getMyPayments } from "../api/paymentsApi.js";
import { getApiErrorMessage } from "../api/client.js";
import PageLoader from "../components/common/PageLoader.jsx";
import ErrorState from "../components/common/ErrorState.jsx";

/**
 * Stripe webhook asinxron gəldiyi üçün, backend statusu bir neçə dəfə
 * yoxlayırıq (webhook checkout tamamlandıqdan az sonra gəlir).
 * Son ödənişə baxırıq — bu, həm abunəlik, həm də tək kurs alışı
 * üçün işləyir (subscription statusu deyil, birbaşa Payment statusu).
 */
const POLL_ATTEMPTS = 5;
const POLL_DELAY_MS = 2000;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSuccessMessage(payment) {
  if (payment?.coursePurchase || payment?.coursePurchaseId) {
    return {
      title: "Ödəniş uğurla tamamlandı",
      description: "Kurs alışınız təsdiqləndi. Kursa girişiniz açıqdır.",
    };
  }

  return {
    title: "Ödəniş uğurla tamamlandı",
    description: "Abunəliyiniz aktivləşdirildi. Premium kurslara giriş açıqdır.",
  };
}

function PaymentSuccessPage() {
  const [status, setStatus] = useState("checking");
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      try {
        for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
          const payments = await getMyPayments();
          const latestPayment = Array.isArray(payments) ? payments[0] : null;

          if (cancelled) return;

          if (latestPayment?.status === "SUCCEEDED") {
            setPayment(latestPayment);
            setStatus("active");
            return;
          }

          if (latestPayment?.status === "FAILED") {
            setPayment(latestPayment);
            setStatus("failed");
            return;
          }

          await wait(POLL_DELAY_MS);
        }

        if (!cancelled) {
          setStatus("pending");
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(getApiErrorMessage(requestError));
          setStatus("error");
        }
      }
    }

    verify();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") {
    return <PageLoader message="Ödəniş təsdiqlənir..." fullPage />;
  }

  if (status === "error") {
    return <ErrorState message={error} />;
  }

  const successMessage = status === "active" ? getSuccessMessage(payment) : null;

  return (
    <section className="payment-result-page">
      {status === "active" && (
        <>
          <CheckCircle2
            size={56}
            className="payment-result-icon payment-result-icon-success"
            aria-hidden="true"
          />
          <h1>{successMessage.title}</h1>
          <p>{successMessage.description}</p>
        </>
      )}

      {status === "failed" && (
        <>
          <XCircle
            size={56}
            className="payment-result-icon payment-result-icon-error"
            aria-hidden="true"
          />
          <h1>Ödəniş uğursuz oldu</h1>
          <p>
            Ödənişiniz təsdiqlənmədi. Zəhmət olmasa, kart məlumatlarınızı
            yoxlayıb yenidən cəhd edin.
          </p>
        </>
      )}

      {status === "pending" && (
        <>
          <Clock
            size={56}
            className="payment-result-icon payment-result-icon-pending"
            aria-hidden="true"
          />
          <h1>Ödəniş təsdiqlənir</h1>
          <p>
            Ödənişiniz alındı, lakin təsdiqlənməsi bir qədər vaxt apara bilər.
            Bir neçə dəqiqədən sonra profilinizdən yoxlayın.
          </p>
        </>
      )}

      <div className="payment-result-actions">
        <Link to="/profile/subscription" className="button button-primary">
          Abunəliyimə bax
        </Link>
        <Link to="/courses" className="button button-secondary">
          Kurslara qayıt
        </Link>
      </div>
    </section>
  );
}

export default PaymentSuccessPage;