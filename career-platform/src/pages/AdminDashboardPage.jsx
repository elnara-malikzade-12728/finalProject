import {
  useEffect,
  useState,
} from "react";
import {
  BriefcaseBusiness,
  FileText,
  Route,
  Users,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  getAdminApplications,
} from "../api/adminApplicationsApi.js";
import { getCareers } from "../api/careersApi.js";
import { getJobs } from "../api/jobsApi.js";
import PageLoader from "../components/common/PageLoader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function getCollectionLength(response, property) {
  if (Array.isArray(response)) {
    return response.length;
  }

  if (Array.isArray(response?.[property])) {
    return response[property].length;
  }

  return null;
}

function AdminDashboardPage() {
  const { user } = useAuth();

  const [statistics, setStatistics] = useState({
    careers: null,
    jobs: null,
    applications: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStatistics() {
      setIsLoading(true);

      const results = await Promise.allSettled([
        getCareers({
          signal: controller.signal,
        }),
        getJobs(
          {},
          {
            signal: controller.signal,
          },
        ),
        getAdminApplications(
          {},
          {
            signal: controller.signal,
          },
        ),
      ]);

      if (controller.signal.aborted) {
        return;
      }

      setStatistics({
        careers:
          results[0].status === "fulfilled"
            ? getCollectionLength(
                results[0].value,
                "careers",
              )
            : null,

        jobs:
          results[1].status === "fulfilled"
            ? getCollectionLength(
                results[1].value,
                "jobs",
              )
            : null,

        applications:
          results[2].status === "fulfilled"
            ? getCollectionLength(
                results[2].value,
                "applications",
              )
            : null,
      });

      setIsLoading(false);
    }

    loadStatistics();

    return () => controller.abort();
  }, []);

  if (isLoading) {
    return (
      <PageLoader message="İdarəetmə paneli hazırlanır..." />
    );
  }

  return (
    <section className="admin-dashboard">
      <div className="admin-dashboard-welcome">
        <div>
          <span className="admin-page-eyebrow">
            İdarəetmə paneli
          </span>

          <h1>
            Xoş gəldiniz,{" "}
            {user?.name || "Administrator"}
          </h1>

          <p>
            Platformanın əsas göstəricilərini
            izləyin və məzmunu bir mərkəzdən
            idarə edin.
          </p>
        </div>

      </div>

      <div className="admin-statistics-grid">
        <article className="admin-statistic-card">
          <span className="admin-statistic-icon">
            <Route size={22} aria-hidden="true" />
          </span>

          <div>
            <span>Kurslar</span>
            <strong>
              {statistics.careers ?? "—"}
            </strong>
          </div>
        </article>

        <article className="admin-statistic-card">
          <span className="admin-statistic-icon">
            <BriefcaseBusiness
              size={22}
              aria-hidden="true"
            />
          </span>

          <div>
            <span>Vakansiyalar</span>
            <strong>
              {statistics.jobs ?? "—"}
            </strong>
          </div>
        </article>

        <article className="admin-statistic-card">
          <span className="admin-statistic-icon">
            <FileText
              size={22}
              aria-hidden="true"
            />
          </span>

          <div>
            <span>Müraciətlər</span>
            <strong>
              {statistics.applications ?? "—"}
            </strong>
          </div>
        </article>

      </div>

      <div className="admin-dashboard-content">
        <section className="admin-dashboard-panel">
          <div className="admin-dashboard-panel-heading">
            <div>
              <span className="admin-page-eyebrow">
                Sürətli əməliyyatlar
              </span>

              <h2>Məzmunu idarə edin</h2>
            </div>
          </div>

          <div className="admin-action-grid">
            <Link
              className="admin-action-card"
              to="/admin/jobs"
            >
              <BriefcaseBusiness
                size={24}
                aria-hidden="true"
              />

              <div>
                <strong>
                  Vakansiyaları idarə et
                </strong>

                <span>
                  Vakansiyaları yaradın,
                  yeniləyin və silin.
                </span>
              </div>
            </Link>

            <Link
              className="admin-action-card"
              to="/admin/applications"
            >
              <Users
                size={24}
                aria-hidden="true"
              />

              <div>
                <strong>
                  Müraciətləri yoxla
                </strong>

                <span>
                  Namizədləri və müraciət
                  statuslarını idarə edin.
                </span>
              </div>
            </Link>

            <Link
              className="admin-action-card"
              to="/admin/videos"
            >
              <Video
                size={24}
                aria-hidden="true"
              />

              <div>
                <strong>Video dərslər</strong>

                <span>
                  Dərslər üçün təhlükəsiz video
                  yükləyin və idarə edin.
                </span>
              </div>
            </Link>
          </div>
        </section>

      </div>
    </section>
  );
}

export default AdminDashboardPage;
