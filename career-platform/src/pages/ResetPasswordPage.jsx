import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPasswordWithToken } from "../api/authApi.js";
import { getApiErrorMessage } from "../api/client.js";
import { removeQueryParameterFromUrl } from "../utils/urlSecurity.js";

function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [token] = useState(() => params.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) removeQueryParameterFromUrl("token");
  }, [token]);

  async function submit(event) {
    event.preventDefault();
    if (password !== confirmPassword) return setError("Şifrələr uyğun gəlmir.");
    try { const result = await resetPasswordWithToken(token, password); setMessage(result.message); setError(""); }
    catch (requestError) { setError(getApiErrorMessage(requestError)); }
  }
  return <section className="auth-section"><div className="container auth-container"><div className="auth-card"><div className="auth-heading"><h1>Yeni şifrə</h1><p>Hesabınız üçün yeni, güclü şifrə təyin edin.</p></div>{message && <div className="alert alert-info">{message}</div>}{error && <div className="alert alert-error" role="alert">{error}</div>}{!message && <form className="auth-form" onSubmit={submit}><div className="form-group"><label htmlFor="new-password">Yeni şifrə</label><input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required /></div><div className="form-group"><label htmlFor="confirm-new-password">Şifrəni təsdiqlə</label><input id="confirm-new-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required /></div><button className="button button-primary button-large auth-submit">Şifrəni yenilə</button></form>}<p className="auth-switch"><Link to="/login">Giriş səhifəsinə keç</Link></p></div></div></section>;
}

export default ResetPasswordPage;
