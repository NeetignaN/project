import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import { FiUser, FiMail, FiPhone, FiMapPin, FiFolder } from "react-icons/fi";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./Clients.module.css";

function Clients({ username, role, userId }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const data = await api.getData("clients");
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setError("Failed to load clients. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  if (loading) {
    return <div className="text-center py-5">Loading clients...</div>;
  }

  if (error) {
    return <div className="alert alert-danger m-3">{error}</div>;
  }

  if (clients.length === 0) {
    return <div className="alert alert-info m-3">No clients found.</div>;
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="mb-0">Clients</h1>
          <p className="text-muted">Manage your client relationships</p>
        </div>
        <div className="col-auto">
          <button className="btn btn-primary">
            <FiUser className="me-2" />
            Add New Client
          </button>
        </div>
      </div>

      <div className="row g-4">
        {clients.map((client) => {
          const initials = client.name
            .split(" ")
            .map((name) => name[0])
            .join("")
            .toUpperCase();

          const projectCount = client.projects ? client.projects.length : 0;

          return (
            <div key={client.id} className="col-md-6 col-lg-4 col-xl-3">
              <div className={`card h-100 shadow-sm ${styles.clientCard}`}>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className={`${styles.avatar} me-3`}>
                      {client.avatar ? (
                        <img
                          src={client.avatar}
                          alt={client.name}
                          className="rounded-circle"
                        />
                      ) : (
                        <div className={styles.initialsAvatar}>{initials}</div>
                      )}
                    </div>
                    <div>
                      <h5 className="card-title mb-0">{client.name}</h5>
                      <p className="card-subtitle text-muted small">
                        {client.company?.name || ""}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <FiMail className="text-muted me-2" />
                      <a
                        href={`mailto:${client.email}`}
                        className={styles.contactLink}
                      >
                        {client.email}
                      </a>
                    </div>

                    {client.phone && (
                      <div className="d-flex align-items-center mb-2">
                        <FiPhone className="text-muted me-2" />
                        <a
                          href={`tel:${client.phone}`}
                          className={styles.contactLink}
                        >
                          {client.phone}
                        </a>
                      </div>
                    )}

                    {client.company?.address && (
                      <div className="d-flex align-items-center mb-2">
                        <FiMapPin className="text-muted me-2" />
                        <span className="small">{client.company.address}</span>
                      </div>
                    )}

                    <div className="d-flex align-items-center">
                      <FiFolder className="text-muted me-2" />
                      <span className="small">
                        {projectCount} Project{projectCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-white border-top-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="badge bg-light text-dark">
                      ${client.total_spend?.toLocaleString() || 0}
                    </span>
                    <a href="#" className="btn btn-sm btn-outline-primary">
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Clients;
