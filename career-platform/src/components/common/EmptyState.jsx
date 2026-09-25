import { Inbox } from "lucide-react";

function EmptyState({
  title = "Məlumat tapılmadı",
  message = "Hazırda göstəriləcək məlumat yoxdur.",
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}) {
  return (
    <section
      className="empty-state"
      aria-labelledby="empty-state-title"
    >
      <div className="empty-state-icon" aria-hidden="true">
        <Icon size={34} strokeWidth={1.8} />
      </div>

      <h2 id="empty-state-title">{title}</h2>
      <p>{message}</p>

      {actionLabel && onAction && (
        <button
          type="button"
          className="button button-primary"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </section>
  );
}

export default EmptyState;