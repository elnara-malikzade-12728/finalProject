import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  Circle,
  ExternalLink,
  RotateCcw,
  Route,
  Trophy,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getCareerById } from "../data/careers.js";
import { jobs } from "../data/jobs.js";

function getProgressKey(userId, careerId) {
  return `career_platform_progress_${userId}_${careerId}`;
}

function readCompletedSteps(userId, careerId) {
  try {
    const savedProgress = localStorage.getItem(
      getProgressKey(userId, careerId),
    );

    return savedProgress ? JSON.parse(savedProgress) : [];
  } catch {
    return [];
  }
}

function RoadmapPage() {
  const { careerId } = useParams();
  const { user } = useAuth();
  const career = getCareerById(careerId);

  const [completedSteps, setCompletedSteps] = useState(() =>
    career && user
      ? readCompletedSteps(user.id, career.id)
      : [],
  );

  useEffect(() => {
    if (career && user) {
      setCompletedSteps(
        readCompletedSteps(user.id, career.id),
      );
    }
  }, [career, user]);

  const progressPercentage = useMemo(() => {
    if (!career?.roadmap.length) {
      return 0;
    }

    return Math.round(
      (completedSteps.length / career.roadmap.length) * 100,
    );
  }, [career, completedSteps]);

  if (!career) {
    return (
      <section className="section">
        <div className="container empty-state">
          <Route size={44} aria-hidden="true" />
          <h1>Yol xəritəsi tapılmadı</h1>
          <p>
            Axtardığınız karyera istiqaməti mövcud deyil.
          </p>

          <Link to="/careers" className="button button-primary">
            <ArrowLeft size={18} />
            Peşələrə qayıt
          </Link>
        </div>
      </section>
    );
  }

  const relatedJobs = jobs.filter(
    (job) => job.careerId === career.id,
  );

  function saveProgress(nextCompletedSteps) {
    setCompletedSteps(nextCompletedSteps);

    localStorage.setItem(
      getProgressKey(user.id, career.id),
      JSON.stringify(nextCompletedSteps),
    );
  }

  function toggleStep(stepId) {
    const isCompleted = completedSteps.includes(stepId);

    const nextCompletedSteps = isCompleted
      ? completedSteps.filter((id) => id !== stepId)
      : [...completedSteps, stepId];

    saveProgress(nextCompletedSteps);
  }

  function resetProgress() {
    const confirmed = window.confirm(
      "Bu yol xəritəsindəki bütün irəliləyişi sıfırlamaq istəyirsiniz?",
    );

    if (confirmed) {
      saveProgress([]);
    }
  }

  return (
    <>
      <section className="roadmap-header">
        <div className="container">
          <Link
            to={`/careers/${career.id}`}
            className="back-link"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            {career.title}
          </Link>

          <div className="roadmap-header-grid">
            <div>
              <span className="eyebrow">Şəxsi yol xəritən</span>
              <h1>{career.title}</h1>
              <p>
                Addımları tamamladıqca işarələ və inkişafını real
                vaxtda izlə.
              </p>
            </div>

            <div className="roadmap-progress-card">
              <div className="progress-summary">
                <div>
                  <span>Ümumi irəliləyiş</span>
                  <strong>{progressPercentage}%</strong>
                </div>

                <Trophy
                  size={32}
                  aria-hidden="true"
                  className={
                    progressPercentage === 100
                      ? "trophy-complete"
                      : ""
                  }
                />
              </div>

              <div
                className="progress-track"
                role="progressbar"
                aria-label={`${career.title} yol xəritəsi irəliləyişi`}
                aria-valuenow={progressPercentage}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <span
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <p>
                {completedSteps.length} / {career.roadmap.length} addım
                tamamlanıb
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container roadmap-layout">
          <div className="roadmap-content">
            {progressPercentage === 100 && (
              <div className="completion-banner" role="status">
                <Trophy size={30} aria-hidden="true" />

                <div>
                  <h2>Təbriklər, {user.name}!</h2>
                  <p>
                    {career.title} yol xəritəsinin bütün addımlarını
                    tamamladın.
                  </p>
                </div>
              </div>
            )}

            <div className="roadmap-list">
              {career.roadmap.map((step, index) => {
                const isCompleted = completedSteps.includes(step.id);

                return (
                  <article
                    key={step.id}
                    className={
                      isCompleted
                        ? "roadmap-step roadmap-step-completed"
                        : "roadmap-step"
                    }
                  >
                    <button
                      type="button"
                      className="roadmap-check-button"
                      onClick={() => toggleStep(step.id)}
                      aria-label={
                        isCompleted
                          ? `${step.title} addımını tamamlanmamış kimi işarələ`
                          : `${step.title} addımını tamamlanmış kimi işarələ`
                      }
                      aria-pressed={isCompleted}
                    >
                      {isCompleted ? (
                        <Check size={20} />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>

                    <div className="roadmap-step-content">
                      <div className="roadmap-step-heading">
                        <div>
                          <span className="step-label">
                            Addım {index + 1}
                          </span>
                          <span className="step-type">
                            {step.type}
                          </span>
                        </div>

                        <span className="step-duration">
                          {step.duration}
                        </span>
                      </div>

                      <h2>{step.title}</h2>
                      <p>{step.description}</p>

                      {step.resource && (
                        <a
                          href={step.resource}
                          target="_blank"
                          rel="noreferrer"
                          className="resource-link"
                        >
                          Tədris resursuna bax
                          <ExternalLink
                            size={17}
                            aria-hidden="true"
                          />
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="roadmap-sidebar">
            <div className="sidebar-card">
              <h2>Növbəti imkanını tap</h2>
              <p>
                Bu istiqamət üzrə {relatedJobs.length} uyğun vakansiya
                və təcrübə proqramı var.
              </p>

              <Link
                to={`/jobs?career=${career.id}`}
                className="button button-primary"
              >
                <BriefcaseBusiness size={18} />
                Elanlara bax
              </Link>
            </div>

            <div className="sidebar-card">
              <h2>İrəliləyişi sıfırla</h2>
              <p>
                Bütün addımları yenidən başlamaq istəyirsinizsə,
                irəliləyişi sıfırlaya bilərsiniz.
              </p>

              <button
                type="button"
                className="button button-danger-ghost"
                onClick={resetProgress}
                disabled={completedSteps.length === 0}
              >
                <RotateCcw size={18} />
                Sıfırla
              </button>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

export default RoadmapPage;