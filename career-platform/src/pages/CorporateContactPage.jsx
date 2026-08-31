import { useState } from "react";
import { Building2, Send } from "lucide-react";
import { submitCorporateInquiry } from "../api/corporateApi.js";
import { getApiErrorMessage } from "../api/client.js";
import Notification from "../components/common/Notification.jsx";

const initialForm = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  employeeCount: "",
  message: "",
};

function CorporateContactPage() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotification(null);

    if (!form.companyName || !form.contactName || !form.email || !form.message) {
      setNotification({
        type: "error",
        message: "Zəhmət olmasa bütün məcburi sahələri doldurun.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitCorporateInquiry({
        companyName: form.companyName,
        contactName: form.contactName,
        email: form.email,
        phone: form.phone || undefined,
        employeeCount: form.employeeCount ? Number(form.employeeCount) : undefined,
        message: form.message,
      });

      setNotification({
        type: "success",
        message: "Sorğunuz göndərildi. Komandamız tezliklə sizinlə əlaqə saxlayacaq.",
      });
      setForm(initialForm);
    } catch (requestError) {
      setNotification({ type: "error", message: getApiErrorMessage(requestError) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-content">
          <span className="eyebrow">
            <Building2 size={17} aria-hidden="true" />
            Korporativ paket
          </span>

          <h1>Bizimlə əlaqə saxlayın</h1>

          <p>Komandanız üçün fərdi təklif almaq üçün formu doldurun.</p>
        </div>
      </section>

      <section className="section jobs-section">
        <div className="container">
          {notification && (
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          )}

          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="companyName">Şirkət adı *</label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={form.companyName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactName">Əlaqədar şəxs *</label>
              <input
                id="contactName"
                name="contactName"
                type="text"
                value={form.contactName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-poçt *</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Telefon</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="employeeCount">İşçi sayı</label>
              <input
                id="employeeCount"
                name="employeeCount"
                type="number"
                min="1"
                value={form.employeeCount}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Mesaj / Təlim ehtiyacı *</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="button button-primary"
              disabled={isSubmitting}
            >
              <Send size={16} aria-hidden="true" />
              {isSubmitting ? "Göndərilir..." : "Göndər"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export default CorporateContactPage;