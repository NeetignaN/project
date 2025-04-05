import { useState } from "react";
import {
  FiSave,
  FiLock,
  FiMail,
  FiGlobe,
  FiUsers,
  FiBell,
} from "react-icons/fi";
import styles from "./DesignerDashboard.module.css";

function AdminSettings({ userId, role }) {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);

    // Simulate saving
    setTimeout(() => {
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="container-fluid py-4">
      <h1 className="h3 mb-4">Admin Settings</h1>

      <div className="row">
        <div className="col-md-3 mb-4 mb-md-0">
          <div className="card shadow-sm">
            <div className="list-group list-group-flush">
              <button
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                  activeTab === "general" ? "active" : ""
                }`}
                onClick={() => setActiveTab("general")}
              >
                <FiGlobe />
                General Settings
              </button>
              <button
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                  activeTab === "account" ? "active" : ""
                }`}
                onClick={() => setActiveTab("account")}
              >
                <FiLock />
                Account Security
              </button>
              <button
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                  activeTab === "notifications" ? "active" : ""
                }`}
                onClick={() => setActiveTab("notifications")}
              >
                <FiBell />
                Notifications
              </button>
              <button
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                  activeTab === "users" ? "active" : ""
                }`}
                onClick={() => setActiveTab("users")}
              >
                <FiUsers />
                User Management
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          <div className="card shadow-sm">
            <div className="card-body">
              {activeTab === "general" && (
                <form onSubmit={handleSave}>
                  <h5 className="mb-4">General Settings</h5>

                  <div className="mb-3">
                    <label htmlFor="siteName" className="form-label">
                      Site Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="siteName"
                      defaultValue="Interiora Admin"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="siteUrl" className="form-label">
                      Site URL
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      id="siteUrl"
                      defaultValue="https://interiora.com"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="contactEmail" className="form-label">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="contactEmail"
                      defaultValue="admin@interiora.com"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="timezone" className="form-label">
                      Timezone
                    </label>
                    <select className="form-select" id="timezone">
                      <option value="UTC">UTC</option>
                      <option value="America/New_York" selected>
                        America/New_York
                      </option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Asia/Tokyo">Asia/Tokyo</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave />
                        Save Changes
                      </>
                    )}
                  </button>
                </form>
              )}

              {activeTab === "account" && (
                <form onSubmit={handleSave}>
                  <h5 className="mb-4">Account Security</h5>

                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="currentPassword"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                    />
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="twoFactor"
                      defaultChecked
                    />
                    <label className="form-check-label" htmlFor="twoFactor">
                      Enable Two-Factor Authentication
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave />
                        Update Security Settings
                      </>
                    )}
                  </button>
                </form>
              )}

              {activeTab === "notifications" && (
                <form onSubmit={handleSave}>
                  <h5 className="mb-4">Notification Settings</h5>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="emailNotifications"
                      defaultChecked
                    />
                    <label
                      className="form-check-label"
                      htmlFor="emailNotifications"
                    >
                      Email Notifications
                    </label>
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="systemNotifications"
                      defaultChecked
                    />
                    <label
                      className="form-check-label"
                      htmlFor="systemNotifications"
                    >
                      System Notifications
                    </label>
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="userNotifications"
                      defaultChecked
                    />
                    <label
                      className="form-check-label"
                      htmlFor="userNotifications"
                    >
                      User Activity Notifications
                    </label>
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="projectNotifications"
                      defaultChecked
                    />
                    <label
                      className="form-check-label"
                      htmlFor="projectNotifications"
                    >
                      Project Update Notifications
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave />
                        Save Notification Preferences
                      </>
                    )}
                  </button>
                </form>
              )}

              {activeTab === "users" && (
                <div>
                  <h5 className="mb-4">User Management Settings</h5>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="allowRegistration"
                      defaultChecked
                    />
                    <label
                      className="form-check-label"
                      htmlFor="allowRegistration"
                    >
                      Allow User Registration
                    </label>
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="adminApproval"
                    />
                    <label className="form-check-label" htmlFor="adminApproval">
                      Require Admin Approval for New Accounts
                    </label>
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="emailVerification"
                      defaultChecked
                    />
                    <label
                      className="form-check-label"
                      htmlFor="emailVerification"
                    >
                      Require Email Verification
                    </label>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="accountLockout" className="form-label">
                      Account Lockout Threshold (Failed Login Attempts)
                    </label>
                    <select className="form-select" id="accountLockout">
                      <option value="3">3 attempts</option>
                      <option value="5" selected>
                        5 attempts
                      </option>
                      <option value="10">10 attempts</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="passwordPolicy" className="form-label">
                      Password Policy
                    </label>
                    <select className="form-select" id="passwordPolicy">
                      <option value="basic">
                        Basic (minimum 8 characters)
                      </option>
                      <option value="medium" selected>
                        Medium (8+ chars, uppercase, lowercase, number)
                      </option>
                      <option value="strong">
                        Strong (8+ chars, uppercase, lowercase, number, special)
                      </option>
                    </select>
                  </div>

                  <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave />
                        Save User Settings
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
