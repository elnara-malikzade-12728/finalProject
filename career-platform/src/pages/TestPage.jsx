import { useEffect, useMemo, useState } from "react";
import { Clock3, LoaderCircle, PlayCircle, ShieldCheck } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client.js";
import { startTestAttempt, getTestById } from "../api/testsApi.js";
import ErrorState from "../components/common/ErrorState.jsx";
import Notification from "../components/common/Notification.jsx";
import PageLoader from "../components/common/PageLoader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function TestPage() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, isInitializing, user } = useAuth();
    const [test, setTest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState("");
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        async function loadTest() {
            try {
                setIsLoading(true);
                const response = await getTestById(testId, { signal: controller.signal });
                setTest(response);
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

        loadTest();

        return () => controller.abort();
    }, [testId]);

    async function handleStartAttempt() {
        if (!isAuthenticated) {
            navigate("/login", {
                state: {
                    from: `/tests/${testId}`,
                    message: "Testə başlamaq üçün daxil olun.",
                },
            });
            return;
        }

        if (user?.role === "ADMIN") {
            setNotification({
                type: "info",
                message: "Administratorlar test cəhdini başlada bilməz.",
            });
            return;
        }

        try {
            setIsStarting(true);
            const attempt = await startTestAttempt(testId);
            navigate(`/attempts/${attempt.id}`);
        } catch (requestError) {
            setNotification({
                type: "error",
                message: getApiErrorMessage(requestError),
            });
        } finally {
            setIsStarting(false);
        }
    }

    const questionCount = useMemo(() => test?.questions?.length || 0, [test]);
    const contextTitle = test?.type === "FINAL"
        ? test?.course?.title || "Yekun imtahan"
        : test?.lesson?.title || "Dərs testi";

    if (isLoading) {
        return <PageLoader message="Test yüklənir..." fullPage />;
    }

    if (error || !test) {
        return (
            <section className="section">
                <div className="container">
                    <ErrorState
                        title="Test tapılmadı"
                        message={error || "Bu test mövcud deyil."}
                        onRetry={() => navigate(0)}
                    />
                </div>
            </section>
        );
    }

    return (
        <section className="section">
            <div className="container test-page-layout">
                <div className="content-card test-intro-card">
                    <Link to="/courses" className="back-link">
                        ← Kurslara qayıt
                    </Link>

                    <span className="tag">{contextTitle}</span>
                    <h1>{test.title}</h1>

                    <p>
                        {test.description || "Bu testi tamamlayaraq bilik səviyyənizi yoxlayın."}
                    </p>

                    <div className="career-overview">
                        <div className="career-overview-item">
                            <ShieldCheck size={20} />
                            <div>
                                <span>Keçid faizi</span>
                                <strong>{test.passScorePercent}%</strong>
                            </div>
                        </div>

                        <div className="career-overview-item">
                            <Clock3 size={20} />
                            <div>
                                <span>Vaxt limiti</span>
                                <strong>
                                    {test.timeLimitMinutes ? `${test.timeLimitMinutes} dəq.` : "Məhdud deyil"}
                                </strong>
                            </div>
                        </div>

                        <div className="career-overview-item">
                            <PlayCircle size={20} />
                            <div>
                                <span>Sual sayı</span>
                                <strong>{questionCount}</strong>
                            </div>
                        </div>
                    </div>

                    {notification && (
                        <Notification
                            type={notification.type}
                            message={notification.message}
                            onClose={() => setNotification(null)}
                        />
                    )}

                    <button
                        type="button"
                        className="button button-primary button-large"
                        onClick={handleStartAttempt}
                        disabled={isStarting || isInitializing}
                    >
                        {isStarting ? <LoaderCircle className="loading-spinner" size={18} /> : null}
                        Testi başlat
                    </button>
                </div>
            </div>
        </section>
    );
}

export default TestPage;
