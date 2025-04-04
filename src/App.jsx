import { DesignerDataProvider } from "./contexts/DesignerDataContext.jsx";
import { ClientDataProvider } from "./contexts/ClientDataContext.jsx";

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
import ClientLayout from "./components/ClientLayout.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ClientDashboard from "./components/ClientDashboard.jsx";
import ClientSettings from "./components/ClientSettings.jsx";
import Clients from "./components/Clients.jsx";
import Projects from "./components/Projects.jsx";
import ClientProjects from "./components/ClientProjects.jsx";
import Messages from "./components/Messages.jsx";
import ClientMessages from "./components/ClientMessages.jsx";
import Schedules from "./components/Schedules.jsx";
import ClientSchedules from "./components/ClientSchedules.jsx";
import Vendors from "./components/Vendors.jsx";
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
      if (user && user.role) {
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
          isAuthenticated && userRole ? (
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

      {/* Client Routes */}
      <Route
        path="/client/*"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <ClientDataProvider>
              <ClientLayout onLogout={handleLogout} username={username} />
            </ClientDataProvider>
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={
            <ClientDashboard
              username={username}
              role={userRole}
              userId={userId}
              userDetails={userDetails}
            />
          }
        />
        <Route
          path="projects"
          element={
            <ClientProjects
              username={username}
              role={userRole}
              userId={userId}
            />
          }
        />
        <Route
          path="messages"
          element={
            <ClientMessages
              username={username}
              role={userRole}
              userId={userId}
            />
          }
        />
        <Route
          path="schedules"
          element={
            <ClientSchedules
              username={username}
              role={userRole}
              userId={userId}
            />
          }
        />
        <Route
          path="settings"
          element={<ClientSettings userId={userId} role={userRole} />}
        />
        <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
      </Route>

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
