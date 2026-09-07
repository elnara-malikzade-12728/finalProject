import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resendVerificationEmail, verifyEmailToken } from "../api/authApi.js";
import { getApiErrorMessage } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const token = params.get("token") || "";
  const [email, setEmail] = useState(params.get("email") || "");
  const [status, setStatus] = useState(token ? "E-poçt təsdiqlənir..." : "Təsdiq keçidi e-poçtunuza göndərildi.");
  const [error, setError] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    verifyEmailToken(token)
      .then(async () => { await refreshUser(); setStatus("E-poçt ünvanınız təsdiqləndi."); })
      .catch((requestError) => setError(getApiErrorMessage(requestError)));
  }, [token, refreshUser]);

  async function resend(event) {
    event.preventDefault();
    try { const result = await resendVerificationEmail(email); setStatus(result.message); setError(""); }
    catch (requestError) { setError(getApiErrorMessage(requestError)); }
  }

  return <section className="auth-section"><div className="container auth-container"><div className="auth-card"><div className="auth-heading"><h1>E-poçt təsdiqi</h1><p>{status}</p></div>{error && <div className="alert alert-error" role="alert">{error}</div>}{token && !error ? <button className="button button-primary button-large auth-submit" onClick={() => navigate("/courses")}>Kurslara keç</button> : <form className="auth-form" onSubmit={resend}><div className="form-group"><label htmlFor="verification-email">E-poçt ünvanı</label><input id="verification-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div><button className="button button-primary button-large auth-submit">Təsdiq məktubunu yenidən göndər</button></form>}<p className="auth-switch"><Link to="/login">Giriş səhifəsinə qayıt</Link></p></div></div></section>;
}

export default VerifyEmailPage;
