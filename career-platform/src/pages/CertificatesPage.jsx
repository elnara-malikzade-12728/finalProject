import { useEffect, useState } from "react";
import { Award, CalendarDays, CheckCircle2, Copy, Download, ExternalLink, LoaderCircle, Printer, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import { downloadCertificate, getMyCertificates, verifyCertificate } from "../api/certificatesApi.js";
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
    const [copiedCode, setCopiedCode] = useState("");
    const [downloadingId, setDownloadingId] = useState(null);

    async function handleDownload(certificate) {
        try {
            setDownloadingId(certificate.id);
            const blob = await downloadCertificate(certificate.id);
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `synex-certificate-${certificate.code}.pdf`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError));
        } finally {
            setDownloadingId(null);
        }
    }

    async function handleCopy(code) {
        await navigator.clipboard?.writeText(code);
        setCopiedCode(code);
        window.setTimeout(() => setCopiedCode(""), 1600);
    }

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
                <div className="content-card certificates-main-card">
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
                                <article key={certificate.id} className="certificate-item certificate-print-area">
                                    <div className="certificate-decoration" aria-hidden="true"><Award size={42} /></div>
                                    <div className="certificate-heading-row"><div><span className="tag tag-success">Etibarlıdır</span><p className="certificate-kicker">Synex Academy sertifikatı</p><h3>{certificate.course?.title}</h3></div><div className="certificate-score"><strong>{certificate.finalScore ?? 0}%</strong><span>Final balı</span></div></div>
                                    <div className="certificate-holder"><UserRound size={19} /><div><span>Sertifikat sahibi</span><strong>{certificate.user?.name || "İstifadəçi"}</strong></div></div>
                                    <div className="certificate-details"><div><span>Sertifikat kodu</span><code>{certificate.code}</code></div><div><span>Verilmə tarixi</span><strong>{new Date(certificate.issuedAt).toLocaleDateString("az-AZ")}</strong></div></div>
                                    <div className="certificate-qr"><div className="certificate-qr-image"><QRCode value={`${window.location.origin}/certificates/${certificate.code}/verify`} size={112} bgColor="#ffffff" fgColor="#2f1a10" level="M" /></div><div><strong>Sertifikatı yoxla</strong><span>QR kodu skan edərək açıq təsdiqləmə səhifəsini açın.</span></div></div>
                                    <div className="certificate-actions no-print">
                                        <button type="button" className="button button-secondary" onClick={() => handleCopy(certificate.code)}><Copy size={17} />{copiedCode === certificate.code ? "Kopyalandı" : "Kodu kopyala"}</button>
                                        <Link className="button button-secondary" to={`/certificates/${certificate.code}/verify`}><ExternalLink size={17} />Açıq yoxlama</Link>
                                        <button type="button" className="button button-primary" onClick={() => handleDownload(certificate)} disabled={downloadingId === certificate.id}><Download size={17} />{downloadingId === certificate.id ? "Hazırlanır..." : "PDF yüklə"}</button>
                                        <button type="button" className="button button-primary" onClick={() => window.print()}><Printer size={17} />Çap et / PDF saxla</button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                <div className="content-card verify-card no-print">
                    <div className="verify-card-heading"><CheckCircle2 size={24} /><div><h2>Sertifikat yoxlama</h2><p>Sertifikat kodunu daxil edərək etibarlılığını yoxlayın.</p></div></div>
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
                                    <strong><CheckCircle2 size={18} /> Etibarlıdır</strong>
                                    <p>{verificationResult.user?.name} — {verificationResult.course?.title}</p>
                                    <small><CalendarDays size={16} /> Verilmə tarixi: {new Date(verificationResult.issuedAt).toLocaleDateString("az-AZ")}</small>
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
