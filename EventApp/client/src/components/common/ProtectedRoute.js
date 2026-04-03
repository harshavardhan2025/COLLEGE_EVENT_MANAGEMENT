import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    const redirect = user.role === 'admin' ? '/admin' : user.role === 'organizer' ? '/organizer' : '/student';
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default ProtectedRoute;
