import { XCircle } from "lucide-react";
import { Link } from "react-router-dom";

function PaymentCancelPage() {
  return (
    <section className="payment-result-page">
      <XCircle
        size={56}
        className="payment-result-icon payment-result-icon-cancel"
        aria-hidden="true"
      />
      <h1>Ödəniş ləğv edildi</h1>
      <p>Ödəniş prosesi tamamlanmadı. İstədiyiniz zaman yenidən cəhd edə bilərsiniz.</p>

      <div className="payment-result-actions">
        <Link to="/pricing" className="button button-primary">
          Planlara qayıt
        </Link>
        <Link to="/courses" className="button button-secondary">
          Kurslara qayıt
        </Link>
      </div>
    </section>
  );
}

export default PaymentCancelPage;