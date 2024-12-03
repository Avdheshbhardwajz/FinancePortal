import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import DashboardLayout from './pages/DashboardLayout';
import Checker from './pages/Checker';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'admin' | 'maker' | 'checker';
}

// Protected Route Component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const location = useLocation();
  const adminToken = localStorage.getItem('adminToken');
  const makerToken = localStorage.getItem('makerToken');
  const checkerToken = localStorage.getItem('checkerToken');

  // Check if user has the correct token for the route
  if (allowedRole === 'admin' && !adminToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole === 'maker' && !makerToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole === 'checker' && !checkerToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Auth Guard Component
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  const makerToken = localStorage.getItem('makerToken');
  const checkerToken = localStorage.getItem('checkerToken');
  // Redirect based on token type
  if (adminToken) {
    return <Navigate to="/admin" replace />;
  }
  
  if (makerToken) {
    return <Navigate to="/dashboard" replace />;
  }

  if (checkerToken) {
    return <Navigate to="/checker" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Auth Route */}
        <Route 
          path="/login" 
          element={
            <AuthGuard>
              <Auth />
            </AuthGuard>
          } 
        />

        {/* Admin Route */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRole="admin">
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Regular maker Dashboard Route */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute allowedRole="maker">
              <DashboardLayout />
            </ProtectedRoute>
          }
        />

         {/* Regular checker Dashboard Route */}
         <Route
          path="/checker/*"
          element={
            <ProtectedRoute allowedRole="checker">
              <Checker/>
            </ProtectedRoute>
          }
        />


        {/* Default Route */}
        <Route 
          path="/" 
          element={<Navigate to="/login" replace />} 
        />

        {/* Catch all other routes */}
        <Route 
          path="*" 
          element={<Navigate to="/login" replace />} 
        />
      </Routes>
    </Router>
  );
};

export default App;