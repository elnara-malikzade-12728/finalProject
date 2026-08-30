import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Clock3, LoaderCircle, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client.js";
import { getAttempt, submitAttempt } from "../api/testsApi.js";
import ErrorState from "../components/common/ErrorState.jsx";
import Notification from "../components/common/Notification.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

function TestAttemptPage() {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState(null);
    const [answers, setAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [notification, setNotification] = useState(null);
    const [remainingSeconds, setRemainingSeconds] = useState(null);
    const autoSubmitStarted = useRef(false);

    useEffect(() => {
        const controller = new AbortController();

        async function loadAttempt() {
            try {
                setIsLoading(true);
                const response = await getAttempt(attemptId, { signal: controller.signal });
                setAttempt(response);
                if (response.status !== "SUBMITTED" && response.test?.timeLimitMinutes) {
                    const deadline = new Date(response.startedAt).getTime() + response.test.timeLimitMinutes * 60000;
                    setRemainingSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
                }
                const initialAnswers = {};
                response.questions?.forEach((question) => {
                    initialAnswers[question.id] = null;
                });
                setAnswers(initialAnswers);
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

        loadAttempt();

        return () => controller.abort();
    }, [attemptId]);

    const questionList = useMemo(() => attempt?.questions || [], [attempt]);
    const answeredCount = useMemo(
        () => Object.values(answers).filter((answer) => answer !== null && answer !== undefined).length,
        [answers],
    );

    useEffect(() => {
        if (remainingSeconds === null || remainingSeconds <= 0 || attempt?.status === "SUBMITTED") return undefined;
        const timer = window.setInterval(() => {
            setRemainingSeconds((current) => current === null ? null : Math.max(0, current - 1));
        }, 1000);
        return () => window.clearInterval(timer);
    }, [remainingSeconds, attempt?.status]);

    useEffect(() => {
        if (remainingSeconds !== 0 || !attempt || attempt.status === "SUBMITTED" || autoSubmitStarted.current) return;
        autoSubmitStarted.current = true;
        handleSubmit({ automatic: true });
    }, [remainingSeconds, attempt]);

    function handleOptionChange(questionId, optionValue) {
        setAnswers((current) => ({
            ...current,
            [questionId]: optionValue,
        }));
    }

    async function handleSubmit({ automatic = false } = {}) {
        if (!automatic && answeredCount < questionList.length) {
            setNotification({
                type: "info",
                message: "Testi göndərmək üçün bütün sualları cavablandırın.",
            });
            return;
        }
        const payload = questionList.map((question) => ({
            questionId: question.id,
            answer: answers[question.id] ?? null,
        }));

        try {
            setIsSubmitting(true);
            const result = await submitAttempt(attemptId, payload);
            setAttempt((current) => ({ ...current, ...result }));
            setRemainingSeconds(null);
            setNotification(automatic
                ? {
                    type: "info",
                    message: "Vaxt bitdiyi üçün cavablar avtomatik göndərildi.",
                }
                : null);
        } catch (requestError) {
            setNotification({
                type: "error",
                message: getApiErrorMessage(requestError),
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return <PageLoader message="Cəhd yüklənir..." fullPage />;
    }

    if (error || !attempt) {
        return (
            <section className="section">
                <div className="container">
                    <ErrorState
                        title="Cəhd tapılmadı"
                        message={error || "Bu cəhd mövcud deyil."}
                    />
                </div>
            </section>
        );
    }

    return (
        <section className="section">
            <div className="container test-attempt-layout">
                <div className="content-card test-attempt-card">
                    <div className="test-attempt-header">
                        <div>
                            <span className="tag">{attempt.test?.type === "FINAL" ? "Final" : "Dərs"}</span>
                            <h1>{attempt.test?.title}</h1>
                        </div>

                        {attempt.status === "SUBMITTED" && (
                            <div className="attempt-score-box">
                                <strong>{attempt.score ?? 0}%</strong>
                                <span>{attempt.passed ? "Uğurlu" : "Uğursuz"}</span>
                            </div>
                        )}
                    </div>

                    {notification && (
                        <Notification
                            type={notification.type}
                            message={notification.message}
                            onClose={() => setNotification(null)}
                        />
                    )}

                    {attempt.status === "SUBMITTED" && (
                        <div className="success-summary">
                            {attempt.passed ? (
                                <CheckCircle2 size={18} />
                            ) : (
                                <XCircle size={18} />
                            )}
                            <span>
                                {attempt.passed
                                    ? "Bu testdən uğurla keçdiniz."
                                    : "Bu cəhd keçid balını toplamadı."}
                            </span>
                        </div>
                    )}

                    {attempt.status !== "SUBMITTED" && attempt.test?.timeLimitMinutes && (
                        <p className="muted-text test-time-limit">
                            <Clock3 size={16} />
                            Qalan vaxt: {remainingSeconds === null
                                ? `${attempt.test.timeLimitMinutes}:00`
                                : `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`}
                        </p>
                    )}

                    <div className="question-list">
                        {questionList.map((question, index) => (
                            <article key={question.id} className="question-card">
                                <h3>
                                    {index + 1}. {question.questionText}
                                </h3>

                                <div className="answer-options">
                                    {question.options?.map((option, optionIndex) => (
                                        <label key={`${question.id}-${optionIndex}`} className="option-item">
                                            <input
                                                type="radio"
                                                name={`question-${question.id}`}
                                                checked={answers[question.id] === option}
                                                onChange={() => handleOptionChange(question.id, option)}
                                                disabled={attempt.status === "SUBMITTED" || isSubmitting}
                                            />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>

                    {attempt.status !== "SUBMITTED" && (
                        <div className="test-submit-bar"><span>{answeredCount}/{questionList.length} sual cavablandırılıb</span><button
                            type="button"
                            className="button button-primary button-large"
                            onClick={() => handleSubmit()}
                            disabled={isSubmitting || answeredCount < questionList.length}
                        >
                            {isSubmitting ? <LoaderCircle className="loading-spinner" size={18} /> : null}
                            Cavabları göndər
                        </button>
                        </div>
                    )}

                    {attempt.status === "SUBMITTED" && (
                        <button
                            type="button"
                            className="button button-primary"
                            onClick={() => navigate(`/tests/${attempt.test.id}`)}
                        >
                            Yenidən cəhd et
                        </button>
                    )}

                    <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => navigate("/courses")}
                    >
                        Kurslara qayıt
                    </button>
                </div>
            </div>
        </section>
    );
}

export default TestAttemptPage;
