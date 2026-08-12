import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
          message: "Bu səhifəyə baxmaq üçün hesabınıza daxil olun.",
        }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;