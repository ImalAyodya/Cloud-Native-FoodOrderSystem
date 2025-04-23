import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

const ProtectedRoutes = ({ children, requireRole }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (!requireRole.includes(user.role)) {
      navigate("/unauthorized");
    }
  }, [user, navigate, requireRole]);

  if (!user || !requireRole.includes(user.role)) return null;

  return children;
};

export default ProtectedRoutes;
