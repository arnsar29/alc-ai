import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEV_MODE = true; // Toggle this when needed

export default function ProtectedRoute({ children }) {
  if (DEV_MODE) {
    return children;
  }

  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}