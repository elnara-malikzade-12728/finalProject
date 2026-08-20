import { Outlet } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import ErrorState from "../common/ErrorState.jsx";
import PageLoader from "../common/PageLoader.jsx";

function AdminRoute() {
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
    return null;
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