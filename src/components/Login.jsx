import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import styles from "./Login.module.css";
import authService from "../services/authService";
import "../index.css";

function Login({ onLoginSuccess }) {
  const [role, setRole] = useState("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Use authService instead of direct fetch call
      const userData = await authService.login(email, password, role);
      console.log(userData);

      // Optionally call onLoginSuccess if you need to store user info globally
      onLoginSuccess(
        userData.username,
        role,
        userData.userId,
        userData.details
      );

      // Redirect to OTP page after successful login
      navigate("/otp", { state: { email, userId: userData.userId, role } });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div>
          <h2 className={styles.title}>Sign in to your account</h2>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <div>
              <label htmlFor="role" className={styles.label}>
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={styles.select}
              >
                <option value="designer">Designer</option>
                <option value="client">User</option>
                <option value="vendor">Vendor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label htmlFor="email" className={styles.label}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className={styles.error}>
              <AlertCircle className={styles.errorIcon} />
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`${styles.button} button`}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
        <p style={{ marginTop: "1rem" }}>
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
