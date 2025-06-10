import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./OtpPage.module.css";

function OtpPage({ onOtpSuccess }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { email, userId, role } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // TODO: Replace this with your real OTP verification logic
    if (otp === "123456") {
      if (onOtpSuccess) onOtpSuccess();
      if (role) {
        navigate(`/${role}/dashboard`);
      } else {
        navigate("/");
      }
    } else {
      setError("Invalid OTP. Please try again.");
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");

  //   try {
  //     const response = await fetch("http://localhost:5000/verify-otp", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email, otp }),
  //     });

  //     const data = await response.json();

  //     if (response.ok && data.success) {
  //       if (onOtpSuccess) onOtpSuccess();
  //       if (role) {
  //         navigate(`/${role}/dashboard`);
  //       } else {
  //         navigate("/");
  //       }
  //     } else {
  //       setError(data.message || "Invalid OTP. Please try again.");
  //     }
  //   } catch (err) {
  //     console.error("Error verifying OTP:", err);
  //     setError("Something went wrong. Please try again later.");
  //   }
  // };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div>
          <h2 className={styles.title}>Enter OTP</h2>
          <p className={styles.subtitle}>
            {email
              ? `OTP sent to ${email}`
              : "Please enter the OTP sent to your email."}
          </p>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <div>
              <label htmlFor="otp" className={styles.label}>
                OTP
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={styles.input}
                placeholder="Enter OTP"
                required
                autoFocus
              />
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <div>
            <button
              type="submit"
              className={styles.button}
              style={{ width: "100%" }}
            >
              Verify OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OtpPage;
