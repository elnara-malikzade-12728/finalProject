import { useEffect, useState } from "react";
import { Award, CheckCircle2, Copy, LoaderCircle } from "lucide-react";
import { getMyCertificates, verifyCertificate } from "../api/certificatesApi.js";
import { getApiErrorMessage } from "../api/client.js";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

function CertificatesPage() {
    const [certificates, setCertificates] = useState([]);
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationResult, setVerificationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function loadCertificates() {
            try {
                setIsLoading(true);
                const data = await getMyCertificates({ signal: controller.signal });
                setCertificates(Array.isArray(data) ? data : []);
            } catch (requestError) {
                if (requestError.name !== "AbortError") {
                    setError(getApiErrorMessage(requestError));
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        loadCertificates();

        return () => controller.abort();
    }, []);

    async function handleVerify() {
        const code = verificationCode.trim();

        if (!code) {
            setVerificationResult({ valid: false, message: "Sertifikat kodunu daxil edin." });
            return;
        }

        try {
            setIsVerifying(true);
            const result = await verifyCertificate(code);
            setVerificationResult({ valid: true, ...result });
        } catch (requestError) {
            setVerificationResult({
                valid: false,
                message: getApiErrorMessage(requestError),
            });
        } finally {
            setIsVerifying(false);
        }
    }

    if (isLoading) {
        return <PageLoader message="Sertifikatlar yüklənir..." fullPage />;
    }

    if (error) {
        return (
            <section className="section">
                <div className="container">
                    <ErrorState title="Sertifikatlar yüklənə bilmədi" message={error} />
                </div>
            </section>
        );
    }

    return (
        <section className="section">
            <div className="container certificates-layout">
                <div className="content-card">
                    <div className="content-card-heading">
                        <Award size={24} />
                        <div>
                            <h1>Sertifikatlarım</h1>
                            <p>Final imtahanını uğurla keçdiyiniz kurslar üçün əldə etdiyiniz sertifikatları görün.</p>
                        </div>
                    </div>

                    {certificates.length === 0 ? (
                        <div className="empty-state-box">
                            <p>Hələ heç bir sertifikat əldə etməmisiniz.</p>
                        </div>
                    ) : (
                        <div className="certificate-list">
                            {certificates.map((certificate) => (
                                <article key={certificate.id} className="certificate-item">
                                    <div>
                                        <span className="tag tag-success">Etibarlıdır</span>
                                        <h3>{certificate.course?.title}</h3>
                                        <p>{certificate.user?.name}</p>
                                    </div>

                                    <div className="certificate-meta">
                                        <span>Kod: {certificate.code}</span>
                                        <span>Final balı: {certificate.finalScore ?? 0}%</span>
                                        <button
                                            type="button"
                                            className="text-button"
                                            onClick={() => navigator.clipboard?.writeText(certificate.code)}
                                        >
                                            <Copy size={16} />
                                            Kodu kopyala
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                <div className="content-card verify-card">
                    <h2>Sertifikat yoxlama</h2>
                    <div className="verification-row">
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(event) => setVerificationCode(event.target.value)}
                            placeholder="Sertifikat kodu"
                        />
                        <button type="button" className="button button-primary" onClick={handleVerify} disabled={isVerifying}>
                            {isVerifying ? <LoaderCircle className="loading-spinner" size={18} /> : <CheckCircle2 size={18} />}
                            Yoxla
                        </button>
                    </div>

                    {verificationResult && (
                        <div className={`verification-result ${verificationResult.valid ? "success" : "error"}`}>
                            {verificationResult.valid ? (
                                <>
                                    <strong>Etibarlıdır.</strong>
                                    <p>{verificationResult.user?.name} — {verificationResult.course?.title}</p>
                                    <small>İssuə tarixi: {new Date(verificationResult.issuedAt).toLocaleDateString("az-AZ")}</small>
                                </>
                            ) : (
                                <p>{verificationResult.message}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default CertificatesPage;
