import { DesignerDataProvider } from "./contexts/DesignerDataContext.jsx";

import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Login from "./components/Login.jsx";
import LandingPage from "./components/LandingPage.jsx";
import DesignerLayout from "./components/DesignerLayout.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Clients from "./components/Clients.jsx"; // Import new Clients component
import Projects from "./components/Projects.jsx"; // Import new Projects component
import Messages from "./components/Messages.jsx"; // Import new Messages component
import Schedules from "./components/Schedules.jsx"; // Import new Schedules component
import Vendors from "./components/Vendors.jsx"; // Import new Vendors component
import authService from "./services/authService.js";

// Main App Component
function App() {
  return <AppContent />;
}

// AppContent component that handles navigation and authentication
function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const [userDetails, setUserDetails] = useState({});
  const navigate = useNavigate(); // For navigation after login

  // Check if user is already authenticated on mount
  useEffect(function () {
    async function checkAuth() {
      const user = authService.getUser(); // Fetch stored user data
      if (user) {
        setIsAuthenticated(true);
        setUsername(user.username);
        setUserRole(user.role.toLowerCase());
        setUserId(user.id);
        setUserDetails(user.details);
      }
    }
    checkAuth();
  }, []);

  function handleLoginSuccess(user, role, id, details) {
    setIsAuthenticated(true);
    setUsername(user);
    setUserRole(role.toLowerCase());
    setUserId(id);
    setUserDetails(details);

    // Redirect to respective dashboard
    navigate(`/${role.toLowerCase()}/dashboard`, { replace: true });
  }

  function handleLogout() {
    authService.logout();
    setIsAuthenticated(false);
    setUsername("");
    setUserRole("");
    setUserId("");

    localStorage.clear();

    navigate("/login");
  }

  // Protected Route wrapper
  function ProtectedRoute({ children, allowedRoles }) {
    if (!isAuthenticated || !allowedRoles.includes(userRole)) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={`/${userRole}/dashboard`} replace />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )
        }
      />

      {/* Protected Routes for different roles */}
      <Route
        path="/designer/*"
        element={
          <ProtectedRoute allowedRoles={["designer"]}>
            <DesignerDataProvider>
              <DesignerLayout onLogout={handleLogout} username={username} />
            </DesignerDataProvider>
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={
            <Dashboard
              username={username}
              role={userRole}
              userId={userId}
              userDetails={userDetails}
            />
          }
        />
        <Route
          path="clients"
          element={
            <Clients username={username} role={userRole} userId={userId} />
          }
        />
        <Route
          path="projects"
          element={
            <Projects username={username} role={userRole} userId={userId} />
          }
        />
        <Route
          path="messages"
          element={
            <Messages username={username} role={userRole} userId={userId} />
          }
        />
        <Route
          path="schedules"
          element={
            <Schedules username={username} role={userRole} userId={userId} />
          }
        />
        <Route
          path="vendors"
          element={
            <Vendors username={username} role={userRole} userId={userId} />
          }
        />
        <Route
          path="*"
          element={<Navigate to="/designer/dashboard" replace />}
        />
      </Route>

      <Route
        path="/client/dashboard"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <Dashboard username={username} role={userRole} userId={userId} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendor/dashboard"
        element={
          <ProtectedRoute allowedRoles={["vendor"]}>
            <Dashboard username={username} role={userRole} userId={userId} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Dashboard username={username} role={userRole} userId={userId} />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
