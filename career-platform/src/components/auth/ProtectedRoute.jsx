import { LoaderCircle } from "lucide-react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

function ProtectedRoute() {
  const {
    isAuthenticated,
    isInitializing,
  } = useAuth();

  const location = useLocation();

  if (isInitializing) {
    return (
      <section className="section">
        <div
          className="container empty-state"
          role="status"
          aria-live="polite"
        >
          <LoaderCircle
            className="loading-spinner"
            size={42}
            aria-hidden="true"
          />

          <h2>Hesab yoxlanılır</h2>
          <p>Zəhmət olmasa gözləyin...</p>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
          message:
            "Bu səhifəyə baxmaq üçün hesabınıza daxil olun.",
        }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;