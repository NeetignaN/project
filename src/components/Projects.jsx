import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import { FiCalendar, FiClock, FiDollarSign, FiPlus } from "react-icons/fi";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./Projects.module.css";

function Projects({ username, role, userId }) {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch projects data
        const projectsData = await api.getData("projects");
        setProjects(projectsData);

        // Fetch clients data for project client names
        const clientsData = await api.getData("clients");
        setClients(clientsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-5">Loading projects...</div>;
  }

  if (error) {
    return <div className="alert alert-danger m-3">{error}</div>;
  }

  if (projects.length === 0) {
    return <div className="alert alert-info m-3">No projects found.</div>;
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-success";
      case "in_progress":
        return "bg-primary";
      default:
        return "bg-secondary";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      default:
        return "Pending";
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";

    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="mb-0">Projects</h1>
          <p className="text-muted">Manage your design projects</p>
        </div>
        <div className="col-auto">
          <button className="btn btn-primary">
            <FiPlus className="me-2" />
            New Project
          </button>
        </div>
      </div>

      <div className="row g-4">
        {projects.map((project) => {
          // Calculate progress percentage
          let progress = 0;

          if (project.status === "completed") {
            progress = 100;
          } else if (project.status === "in_progress") {
            // Mock value, would be calculated based on timeline/tasks
            progress = 30;
          }

          return (
            <div key={project.id} className="col-md-6 col-lg-4">
              <div className={`card h-100 shadow-sm ${styles.projectCard}`}>
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span
                    className={`badge ${getStatusBadgeClass(project.status)}`}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                  <small className="text-muted">ID: {project.id}</small>
                </div>
                <div className="card-body">
                  <h5 className="card-title mb-3">{project.title}</h5>

                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <span className="text-muted me-2">Client:</span>
                      <strong>{getClientName(project.client_id)}</strong>
                    </div>

                    <div className="d-flex align-items-center mb-2">
                      <FiDollarSign className="text-muted me-2" />
                      <span>${project.budget?.toLocaleString() || 0}</span>
                    </div>

                    <div className="d-flex align-items-center mb-2">
                      <FiCalendar className="text-muted me-2" />
                      <span>{formatDate(project.timeline?.start)}</span>
                    </div>

                    {project.timeline?.estimated_end && (
                      <div className="d-flex align-items-center">
                        <FiClock className="text-muted me-2" />
                        <span>
                          Due: {formatDate(project.timeline.estimated_end)}
                        </span>
                      </div>
                    )}
                  </div>

                  {project.status !== "pending" && (
                    <div className={styles.progressWrapper}>
                      <div className="d-flex justify-content-between mb-1">
                        <small>Progress</small>
                        <small>{progress}%</small>
                      </div>
                      <div className="progress" style={{ height: "6px" }}>
                        <div
                          className={`progress-bar ${
                            project.status === "completed"
                              ? "bg-success"
                              : "bg-primary"
                          }`}
                          role="progressbar"
                          style={{ width: `${progress}%` }}
                          aria-valuenow={progress}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="card-footer bg-white border-top-0">
                  <a href="#" className="btn btn-outline-primary w-100">
                    View Details
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Projects;
