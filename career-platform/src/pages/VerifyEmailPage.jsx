import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { checkEmailVerificationStatus, getVerificationStatusToken, resendVerificationEmail, verifyEmailToken } from "../api/authApi.js";
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
  const [verificationComplete, setVerificationComplete] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    let cancelled = false;
    let redirectTimer;

    verifyEmailToken(token)
      .then(async () => {
        const verifiedUser = await refreshUser();
        if (cancelled) return;
        if (!verifiedUser) throw new Error("Təsdiqdən sonra istifadəçi məlumatlarını yükləmək mümkün olmadı.");
        setVerificationComplete(true);
        setStatus("E-poçt ünvanınız uğurla təsdiqləndi. Şəxsi kabinetə yönləndirilirsiniz...");
        redirectTimer = window.setTimeout(() => navigate("/profile", { replace: true }), 1500);
      })
      .catch((requestError) => {
        if (!cancelled) setError(getApiErrorMessage(requestError));
      });

    return () => {
      cancelled = true;
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [token, refreshUser, navigate]);

  useEffect(() => {
    if (token) return undefined;
    const statusToken = getVerificationStatusToken();
    if (!statusToken) return undefined;

    let cancelled = false;
    let checking = false;
    const controller = new AbortController();

    async function checkStatus() {
      if (checking || cancelled || document.visibilityState === "hidden") return;
      checking = true;
      try {
        const result = await checkEmailVerificationStatus(statusToken, { signal: controller.signal });
        if (!result?.verified || cancelled) return;
        const verifiedUser = await refreshUser();
        if (!verifiedUser || cancelled) return;
        setVerificationComplete(true);
        setStatus("E-poçt ünvanınız təsdiqləndi. Şəxsi kabinetə yönləndirilirsiniz...");
        navigate("/profile", { replace: true });
      } catch (requestError) {
        if (requestError.name !== "AbortError" && !cancelled) {
          setError(getApiErrorMessage(requestError));
        }
      } finally {
        checking = false;
      }
    }

    checkStatus();
    const interval = window.setInterval(checkStatus, 5000);
    window.addEventListener("focus", checkStatus);
    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener("focus", checkStatus);
    };
  }, [token, refreshUser, navigate]);

  async function resend(event) {
    event.preventDefault();
    try { const result = await resendVerificationEmail(email); setStatus(result.message); setError(""); }
    catch (requestError) { setError(getApiErrorMessage(requestError)); }
  }

  return <section className="auth-section"><div className="container auth-container"><div className="auth-card"><div className="auth-heading"><h1>E-poçt təsdiqi</h1><p>{status}</p></div>{error && <div className="alert alert-error" role="alert">{error}</div>}{verificationComplete ? <button className="button button-primary button-large auth-submit" onClick={() => navigate("/profile", { replace: true })}>Şəxsi kabinetə keç</button> : !token && <form className="auth-form" onSubmit={resend}><div className="form-group"><label htmlFor="verification-email">E-poçt ünvanı</label><input id="verification-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div><button className="button button-primary button-large auth-submit">Təsdiq məktubunu yenidən göndər</button></form>}<p className="auth-switch"><Link to="/login">Giriş səhifəsinə qayıt</Link></p></div></div></section>;
}

export default VerifyEmailPage;
