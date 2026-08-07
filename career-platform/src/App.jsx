import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import CareersPage from "./pages/CareersPage.jsx";
import CareerDetailsPage from "./pages/CareerDetailsPage.jsx";
import RoadmapPage from "./pages/RoadmapPage.jsx";
import JobsPage from "./pages/JobsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />

          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          <Route path="careers" element={<CareersPage />} />
          <Route
            path="careers/:careerId"
            element={<CareerDetailsPage />}
          />

          <Route path="jobs" element={<JobsPage />} />

          <Route element={<ProtectedRoute />}>
            <Route
              path="roadmap/:careerId"
              element={<RoadmapPage />}
            />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;