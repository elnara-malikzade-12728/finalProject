import { useEffect, useState } from "react";
import { Award, LoaderCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import { verifyCertificate } from "../api/certificatesApi.js";
import { getApiErrorMessage } from "../api/client.js";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

function CertificateVerifyPage() {
    const { verificationCode } = useParams();
    const [verification, setVerification] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function loadVerification() {
            try {
                setIsLoading(true);
                const result = await verifyCertificate(verificationCode, { signal: controller.signal });
                setVerification(result);
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

        loadVerification();

        return () => controller.abort();
    }, [verificationCode]);

    if (isLoading) {
        return <PageLoader message="Sertifikat yoxlanılır..." fullPage />;
    }

    if (error || !verification) {
        return (
            <section className="section">
                <div className="container">
                    <ErrorState title="Sertifikat tapılmadı" message={error || "Bu sertifikat etibarlı deyil."} />
                </div>
            </section>
        );
    }

    return (
        <section className="section">
            <div className="container">
                <div className="content-card verify-page-card">
                    <div className="content-card-heading">
                        <Award size={24} />
                        <div>
                            <h1>Sertifikat təsdiq edildi</h1>
                            <p>Bu kod ilə verilmiş sertifikat etibarlıdır.</p>
                        </div>
                    </div>

                    <div className="verification-result success">
                        <strong>{verification.user?.name}</strong>
                        <p>{verification.course?.title}</p>
                        <small>Kod: {verification.code}</small>
                        <small>İssuə tarixi: {new Date(verification.issuedAt).toLocaleDateString("az-AZ")}</small>
                        <small>Final balı: {verification.finalScore ?? 0}%</small>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CertificateVerifyPage;
