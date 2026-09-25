import { LoaderCircle } from "lucide-react";

function PageLoader({
  message = "Məlumatlar yüklənir...",
  fullPage = false,
}) {
  const className = fullPage
    ? "page-loader page-loader-full"
    : "page-loader";

  return (
    <div
      className={className}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <LoaderCircle
        className="loading-spinner"
        size={34}
        aria-hidden="true"
      />

      <p>{message}</p>
    </div>
  );
}

export default PageLoader;