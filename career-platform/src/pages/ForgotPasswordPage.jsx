import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api/authApi.js";
import { getApiErrorMessage } from "../api/client.js";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    try { const result = await requestPasswordReset(email); setMessage(result.message); setError(""); }
    catch (requestError) { setError(getApiErrorMessage(requestError)); }
  }
  return <section className="auth-section"><div className="container auth-container"><div className="auth-card"><div className="auth-heading"><h1>Şifrəni yenilə</h1><p>Şifrə yeniləmə keçidi almaq üçün e-poçt ünvanınızı daxil edin.</p></div>{message && <div className="alert alert-info">{message}</div>}{error && <div className="alert alert-error" role="alert">{error}</div>}<form className="auth-form" onSubmit={submit}><div className="form-group"><label htmlFor="reset-email">E-poçt ünvanı</label><input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div><button className="button button-primary button-large auth-submit">Keçidi göndər</button></form><p className="auth-switch"><Link to="/login">Giriş səhifəsinə qayıt</Link></p></div></div></section>;
}

export default ForgotPasswordPage;
