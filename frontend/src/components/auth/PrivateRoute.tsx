import { Navigate } from 'react-router-dom';
import { JSX, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';

interface PrivateRouteProps {
  element: JSX.Element;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { checkSession } = useAuthStore();

  useEffect(() => {
    checkSession().then((data) => {
      setIsAuthenticated(!data.expired);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? treatNavigation(element) : <Navigate to="/" />;
};

function treatNavigation(element: JSX.Element) {
  if (element.type.name === 'Login' || element.type.name === 'Register' || element.type.name === 'ForgotPassword' || element.type.name === 'Landing') {
    return <Navigate to="/dashboard" />;
  }
  return element;
}