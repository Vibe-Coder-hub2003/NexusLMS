import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Role } from './types';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BatchManagement from './pages/admin/BatchManagement';
import UserManagement from './pages/admin/UserManagement';
import AssignmentManagement from './pages/instructor/AssignmentManagement';
import Grading from './pages/instructor/Grading';
import Settings from './pages/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: Role[] }> = ({ children, roles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading NexusLMS...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Dashboard (Shared) */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/batches" element={
              <ProtectedRoute roles={[Role.ADMIN]}>
                <BatchManagement />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute roles={[Role.ADMIN]}>
                <UserManagement />
              </ProtectedRoute>
            } />

            {/* Instructor & Student Shared Routes (View logic inside component) */}
            <Route path="/assignments" element={
              <ProtectedRoute roles={[Role.INSTRUCTOR, Role.STUDENT]}>
                <AssignmentManagement />
              </ProtectedRoute>
            } />
            
             <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />

            {/* Instructor Only */}
            <Route path="/grading" element={
              <ProtectedRoute roles={[Role.INSTRUCTOR]}>
                <Grading />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;