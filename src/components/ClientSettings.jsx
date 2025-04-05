import React, { useState, useEffect } from "react";
import { useClientData } from "../contexts/ClientDataContext";
import styles from "./DesignerDashboard.module.css"; // Reuse styles from DesignerDashboard for now
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiHome,
  FiCreditCard,
  FiLock,
} from "react-icons/fi";

function ClientSettings({ userId, role }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Carter",
    email: "john.carter@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, Anytown, CA 12345",
    companyName: "Carter Home Designs",
    preferredContact: "email",
  });

  // Handle form submission
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert("Profile updated successfully!");
    }, 1000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert("Password updated successfully!");
      // Reset form
      e.target.reset();
    }, 1000);
  };

  return (
    <div className="container-fluid p-0">
      <h2 className="h4 mb-4">Settings</h2>

      <div className="row">
        {/* Settings Navigation */}
        <div className="col-md-3 mb-4">
          <div className="card shadow-sm">
            <div className="list-group list-group-flush">
              <button
                className={`list-group-item list-group-item-action d-flex align-items-center ${
                  activeTab === "profile" ? "active" : ""
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <FiUser className="me-2" /> Profile
              </button>
              <button
                className={`list-group-item list-group-item-action d-flex align-items-center ${
                  activeTab === "password" ? "active" : ""
                }`}
                onClick={() => setActiveTab("password")}
              >
                <FiLock className="me-2" /> Password
              </button>
              <button
                className={`list-group-item list-group-item-action d-flex align-items-center ${
                  activeTab === "billing" ? "active" : ""
                }`}
                onClick={() => setActiveTab("billing")}
              >
                <FiCreditCard className="me-2" /> Billing
              </button>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="col-md-9">
          <div className="card shadow-sm">
            <div className="card-body">
              {/* Profile Settings */}
              {activeTab === "profile" && (
                <>
                  <h3 className="h5 mb-4">Profile Information</h3>
                  <form onSubmit={handleProfileSubmit}>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="fullName" className="form-label">
                          Full Name
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FiUser />
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            id="fullName"
                            value={profile.name}
                            onChange={(e) =>
                              setProfile({ ...profile, name: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label">
                          Email
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FiMail />
                          </span>
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={profile.email}
                            onChange={(e) =>
                              setProfile({ ...profile, email: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="phone" className="form-label">
                          Phone
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FiPhone />
                          </span>
                          <input
                            type="tel"
                            className="form-control"
                            id="phone"
                            value={profile.phone}
                            onChange={(e) =>
                              setProfile({ ...profile, phone: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="companyName" className="form-label">
                          Company Name
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FiHome />
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            id="companyName"
                            value={profile.companyName}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                companyName: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="address" className="form-label">
                        Address
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FiMapPin />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          id="address"
                          value={profile.address}
                          onChange={(e) =>
                            setProfile({ ...profile, address: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label">
                        Preferred Contact Method
                      </label>
                      <div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="contactMethod"
                            id="contactEmail"
                            value="email"
                            checked={profile.preferredContact === "email"}
                            onChange={() =>
                              setProfile({
                                ...profile,
                                preferredContact: "email",
                              })
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor="contactEmail"
                          >
                            Email
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="contactMethod"
                            id="contactPhone"
                            value="phone"
                            checked={profile.preferredContact === "phone"}
                            onChange={() =>
                              setProfile({
                                ...profile,
                                preferredContact: "phone",
                              })
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor="contactPhone"
                          >
                            Phone
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Password Settings */}
              {activeTab === "password" && (
                <>
                  <h3 className="h5 mb-4">Change Password</h3>
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="mb-3">
                      <label htmlFor="currentPassword" className="form-label">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="currentPassword"
                        required
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
                        required
                      />
                      <div className="form-text">
                        Password must be at least 8 characters and include a mix
                        of letters, numbers, and symbols.
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        required
                      />
                    </div>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Billing Settings */}
              {activeTab === "billing" && (
                <>
                  <h3 className="h5 mb-4">Billing Information</h3>
                  <div className="alert alert-info">
                    <p className="mb-0">
                      Your billing information is managed through our secure
                      payment processing system. Please contact your project
                      manager for any billing-related inquiries.
                    </p>
                  </div>

                  <h4 className="h6 mt-4 mb-3">Payment Methods</h4>
                  <div className="card mb-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="d-flex align-items-center">
                            <FiCreditCard className="me-2 text-primary" />
                            <strong>Visa ending in 4567</strong>
                          </div>
                          <small className="text-muted">Expires 12/2025</small>
                        </div>
                        <div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                    <button type="button" className="btn btn-outline-primary">
                      <FiCreditCard className="me-2" /> Add Payment Method
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientSettings;
