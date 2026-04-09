import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser, getRedirectPathByRole } from "../api/authApi";

const ProtectedRoute = ({ children, roles = [] }) => {
  const location = useLocation();
  const authed = Boolean(localStorage.getItem('token'));
  const user = getCurrentUser();

  if (!authed || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to={getRedirectPathByRole(user?.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;