import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import DashboardLayout from './pages/DashboardLayout';
import Checker from './pages/Checker';

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

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'admin' | 'maker' | 'checker';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const token = localStorage.getItem(`${allowedRole}Token`);
  
  if (!token) {
    return <Navigate to="/login" replace />;
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

        {/* Maker Dashboard Route */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute allowedRole="maker">
              <DashboardLayout />
            </ProtectedRoute>
          }
        />

        {/* Checker Dashboard Route */}
        <Route
          path="/checker/*"
          element={
            <ProtectedRoute allowedRole="checker">
              <Checker />
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