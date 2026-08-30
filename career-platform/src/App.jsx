import { lazy, Suspense } from "react";
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AdminRoute from "./components/auth/AdminRoute.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import PageLoader from "./components/common/PageLoader.jsx";
import Layout from "./components/layout/Layout.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

const HomePage = lazy(
  () => import("./pages/HomePage.jsx"),
);

const LoginPage = lazy(
  () => import("./pages/LoginPage.jsx"),
);

const RegisterPage = lazy(
  () => import("./pages/RegisterPage.jsx"),
);

const CareersPage = lazy(
  () => import("./pages/CareersPage.jsx"),
);

const CareerDetailsPage = lazy(
  () => import("./pages/CareerDetailsPage.jsx"),
);
const CourseDetailsPage = lazy(
  () => import("./pages/CourseDetailsPage.jsx"),
);

const RoadmapPage = lazy(
  () => import("./pages/RoadmapPage.jsx"),
);

const JobsPage = lazy(
  () => import("./pages/JobsPage.jsx"),
);

const JobDetailsPage = lazy(
  () => import("./pages/JobDetailsPage.jsx"),
);

const MyApplicationsPage = lazy(
  () => import("./pages/MyApplicationsPage.jsx"),
);

const ProfilePage = lazy(
  () => import("./pages/ProfilePage.jsx"),
);

const TestPage = lazy(
  () => import("./pages/TestPage.jsx"),
);

const TestAttemptPage = lazy(
  () => import("./pages/TestAttemptPage.jsx"),
);

const CertificatesPage = lazy(
  () => import("./pages/CertificatesPage.jsx"),
);

const CertificateVerifyPage = lazy(
  () => import("./pages/CertificateVerifyPage.jsx"),
);

const NotFoundPage = lazy(
  () => import("./pages/NotFoundPage.jsx"),
);

const AdminLayout = lazy(
  () =>
    import(
      "./components/admin/AdminLayout.jsx"
    ),
);

const AdminDashboardPage = lazy(
  () =>
    import(
      "./pages/AdminDashboardPage.jsx"
    ),
);

const AdminJobsPage = lazy(
  () => import("./pages/AdminJobsPage.jsx"),
);

const AdminJobFormPage = lazy(
  () => import("./pages/AdminJobFormPage.jsx"),
);

const AdminApplicationsPage = lazy(
  () =>
    import(
      "./pages/AdminApplicationsPage.jsx"
    ),
);
const AdminVideoPage = lazy(
  () => import("./pages/AdminVideoPage.jsx"),
);
const AdminCoursesPage = lazy(
  () => import("./pages/AdminCoursesPage.jsx"),
);
const TestsPage = lazy(
  () => import("./pages/TestsPage.jsx"),
);
const AdminTestsPage = lazy(
  () => import("./pages/AdminTestsPage.jsx"),
);

function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <PageLoader
            message="Səhifə yüklənir..."
            fullPage
          />
        }
      >
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />

            <Route
              path="login"
              element={<LoginPage />}
            />

            <Route
              path="register"
              element={<RegisterPage />}
            />

            <Route
              path="careers"
              element={<Navigate to="/courses" replace />}
            />

            <Route
              path="careers/:careerId"
              element={<CareerDetailsPage />}
            />

            <Route
              path="courses"
              element={<CareersPage />}
            />

            <Route
              path="courses/:courseId"
              element={<CourseDetailsPage />}
            />

            <Route
              path="jobs"
              element={<JobsPage />}
            />

            <Route
              path="jobs/:id"
              element={<JobDetailsPage />}
            />

            <Route
              path="tests"
              element={<TestsPage />}
            />

            <Route
              path="tests/:testId"
              element={<TestPage />}
            />

            <Route
              path="certificates/:verificationCode/verify"
              element={<CertificateVerifyPage />}
            />

            <Route element={<ProtectedRoute />}>
              <Route
                path="roadmap/:careerId"
                element={<RoadmapPage />}
              />

              <Route
                path="profile"
                element={<ProfilePage />}
              />

              <Route
                path="applications/me"
                element={<MyApplicationsPage />}
              />

              <Route
                path="attempts/:attemptId"
                element={<TestAttemptPage />}
              />

              <Route
                path="certificates"
                element={<CertificatesPage />}
              />

              <Route element={<AdminRoute />}>
                <Route
                  path="admin"
                  element={<AdminLayout />}
                >
                  <Route
                    index
                    element={
                      <AdminDashboardPage />
                    }
                  />
                  <Route
                    path="videos"
                    element={<AdminVideoPage />}
                  />
                  <Route
                    path="courses"
                    element={<AdminCoursesPage />}
                  />
                  <Route
                    path="tests"
                    element={<AdminTestsPage />}
                  />

                  <Route
                    path="jobs"
                    element={<AdminJobsPage />}
                  />

                  <Route
                    path="jobs/new"
                    element={
                      <AdminJobFormPage />
                    }
                  />

                  <Route
                    path="jobs/:jobId/edit"
                    element={
                      <AdminJobFormPage />
                    }
                  />

                  <Route
                    path="applications"
                    element={
                      <AdminApplicationsPage />
                    }
                  />
                </Route>
              </Route>
            </Route>

            <Route
              path="404"
              element={<NotFoundPage />}
            />

            <Route
              path="*"
              element={
                <Navigate to="/404" replace />
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
