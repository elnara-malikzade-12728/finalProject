import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

const notificationIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

function Notification({
  type = "info",
  message,
  onClose,
}) {
  if (!message) {
    return null;
  }

  const Icon = notificationIcons[type] || Info;
  const role = type === "error" ? "alert" : "status";

  return (
    <div
      className={`notification notification-${type}`}
      role={role}
      aria-live={type === "error" ? "assertive" : "polite"}
    >
      <Icon
        className="notification-icon"
        size={21}
        aria-hidden="true"
      />

      <p>{message}</p>

      {onClose && (
        <button
          type="button"
          className="notification-close"
          onClick={onClose}
          aria-label="Bildirişi bağla"
        >
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default Notification;