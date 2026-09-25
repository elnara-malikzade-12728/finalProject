import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import ErrorState from "../common/ErrorState.jsx";
import PageLoader from "../common/PageLoader.jsx";

function AdminRoute() {
  const location = useLocation();
  const {
    user,
    isAuthenticated,
    isInitializing,
  } = useAuth();

  if (isInitializing) {
    return (
      <PageLoader
        message="İstifadəçi icazələri yoxlanılır..."
        fullPage
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  const hasAdminAccess =
    user?.role === "ADMIN" ||
    (
      import.meta.env.DEV &&
      import.meta.env.VITE_ADMIN_PREVIEW === "true"
    );

  if (!hasAdminAccess) {
    return (
      <section className="section">
        <div className="container">
          <ErrorState
            title="Giriş icazəsi yoxdur"
            message="Bu səhifə yalnız administratorlar üçün nəzərdə tutulub."
          />
        </div>
      </section>
    );
  }

  return <Outlet />;
}

export default AdminRoute;
