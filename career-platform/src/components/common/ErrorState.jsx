import { AlertTriangle, RefreshCw } from "lucide-react";

function ErrorState({
  title = "Xəta baş verdi",
  message = "Məlumatları əldə etmək mümkün olmadı.",
  onRetry,
  retryLabel = "Yenidən cəhd et",
}) {
  return (
    <section
      className="error-state"
      role="alert"
      aria-labelledby="error-state-title"
    >
      <div className="error-state-icon" aria-hidden="true">
        <AlertTriangle size={34} strokeWidth={1.8} />
      </div>

      <h2 id="error-state-title">{title}</h2>
      <p>{message}</p>

      {onRetry && (
        <button
          type="button"
          className="button button-primary"
          onClick={onRetry}
        >
          <RefreshCw size={18} aria-hidden="true" />
          {retryLabel}
        </button>
      )}
    </section>
  );
}

export default ErrorState;