import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getStoredToken } from '@/utils/auth';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = getStoredToken();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [token, location, navigate]);

  if (!token) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard; 