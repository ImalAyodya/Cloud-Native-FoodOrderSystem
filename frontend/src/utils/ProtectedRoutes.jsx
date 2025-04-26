import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/authService";

const ProtectedRoutes = ({ children, requireRole }) => {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = authService.getCurrentUser();
      const isAuthenticated = authService.isAuthenticated();

      if (!isAuthenticated || !currentUser) {
        return false;
      }

      if (requireRole && !requireRole.includes(currentUser.role)) {
        return false;
      }

      return true;
    };

    const isAuthorized = checkAuth();
    setAuthorized(isAuthorized);
    setLoading(false);
  }, [requireRole]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoutes;