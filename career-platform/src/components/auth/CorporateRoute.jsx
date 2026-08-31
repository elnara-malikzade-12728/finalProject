import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import ErrorState from "../common/ErrorState.jsx";
import PageLoader from "../common/PageLoader.jsx";

function CorporateRoute() {
  const location = useLocation();
  const { user, isAuthenticated, isInitializing } = useAuth();
  if (isInitializing) return <PageLoader message="Korporativ icazə yoxlanılır..." fullPage />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!user?.isCorporate && user?.role !== "ADMIN") {
    return <section className="section"><div className="container"><ErrorState title="Korporativ təsdiq tələb olunur" message="Şirkət paneli üçün korporativ müraciət göndərin. Administrator təsdiq etdikdən sonra yenidən daxil olun." /></div></section>;
  }
  return <Outlet />;
}

export default CorporateRoute;
