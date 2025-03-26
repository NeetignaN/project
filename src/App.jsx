import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import LandingPage from './components/LandingPage.jsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');

  const handleLoginSuccess = (user, role) => {
    setIsAuthenticated(true);
    setUsername(user);
    setUserRole(role);
  };

  // Protected Route wrapper component
  const ProtectedRoute = ({ children, allowedRole }) => {
    if (!isAuthenticated || userRole !== allowedRole) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            isAuthenticated ?
              <Navigate to={`/${userRole.toLowerCase()}/dashboard`} /> :
              <Login onLoginSuccess={handleLoginSuccess} />
          }
        />

        {/* Protected Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRole="admin">
            <Dashboard username={username} role="admin" />
          </ProtectedRoute>
        } />

        <Route path="/manager/*" element={
          <ProtectedRoute allowedRole="manager">
            <Dashboard username={username} role="manager" />
          </ProtectedRoute>
        } />

        <Route path="/user/*" element={
          <ProtectedRoute allowedRole="user">
            <Dashboard username={username} role="user" />
          </ProtectedRoute>
        } />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
