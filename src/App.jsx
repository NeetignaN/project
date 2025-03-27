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
import authService from "./services/authService.js";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate(); // For navigation after login

  // Check if user is already authenticated
  useEffect(function () {
    async function checkAuth() {
      const user = authService.getUser(); // Fetch stored user data
      if (user) {
        setIsAuthenticated(true);
        setUsername(user.username);
        setUserRole(user.role.toLowerCase());
        setUserId(user.id);
      }
    }
    checkAuth();
  }, []);

  function handleLoginSuccess(user, role, id) {
    setIsAuthenticated(true);
    setUsername(user);
    setUserRole(role.toLowerCase());
    setUserId(id);

    // Redirect to respective dashboard
    navigate(`/${role.toLowerCase()}/dashboard`, { replace: true });
  }

  function handleLogout() {
    authService.logout();
    setIsAuthenticated(false);
    setUsername("");
    setUserRole("");
    setUserId("");
    navigate("/login");
  }

  // Protected Route wrapper
  function ProtectedRoute({ children, allowedRoles }) {
    console.log("ProtectedRoute rendered for role:", userRole);
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
            <DesignerLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={
            <Dashboard
              username={username}
              userId={userId}
              onLogout={handleLogout}
            />
          }
        />
        <Route path="clients" element={<p>clients</p>} />
        <Route path="projects" element={<p>projects</p>} />
        <Route path="vendors" element={<p>vendors</p>} />
        <Route
          path="*"
          element={<Navigate to="/designer/dashboard" replace />}
        />
      </Route>

      <Route
        path="/client/dashboard"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <Dashboard
              username={username}
              userId={userId}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendor/dashboard"
        element={
          <ProtectedRoute allowedRoles={["vendor"]}>
            <Dashboard
              username={username}
              userId={userId}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Dashboard
              username={username}
              userId={userId}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
