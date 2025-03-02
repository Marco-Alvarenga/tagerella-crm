// src/client/components/Auth/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  
  const isTokenValid = () => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      localStorage.removeItem('token');
      return false;
    }
  }  

  if (!isTokenValid() && location.pathname !== '/login') {
    localStorage.removeItem('token');
    return <Navigate to="/login" />;
  }

  if (token && location.pathname === '/login') {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;