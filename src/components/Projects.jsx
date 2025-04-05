import React, { useState } from "react";
import api from "../services/api.js";
import { FiCalendar, FiClock, FiDollarSign, FiPlus, FiX } from "react-icons/fi";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./Projects.module.css";
import { useDesignerData } from "../contexts/DesignerDataContext";
import ProjectDetails from "./ProjectDetails";
import { Modal, Button, Form } from "react-bootstrap";

function Projects({ username, role, userId }) {
  const { projects, clients, setProjects } = useDesignerData();
  console.log("Projects in Projects Component:", projects);
  console.log("Clients in Projects Component:", clients);

  // State for the project details modal
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // State for the new project form
  const [newProject, setNewProject] = useState({
    title: "",
    client_id: "",
    designer_id: userId,
    status: "active",
    budget: 0,
    timeline: {
      start: new Date().toISOString().split("T")[0],
      estimated_end: "",
    },
    notes: "",
    moodboard: [],
  });

  const [imageUrl, setImageUrl] = useState("");

  // Function to handle opening the project details
  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  // Function to handle closing the project details
  const handleCloseDetails = () => {
    setShowDetailsModal(false);
  };

  // Function to handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setNewProject({
        ...newProject,
        [parent]: {
          ...newProject[parent],
          [child]: value,
        },
      });
    } else {
      setNewProject({
        ...newProject,
        [name]: value,
      });
    }
  };

  // Function to add an image to the moodboard
  const handleAddImage = () => {
    if (imageUrl.trim() !== "") {
      setNewProject({
        ...newProject,
        moodboard: [...newProject.moodboard, imageUrl],
      });
      setImageUrl("");
    }
  };

  // Function to remove an image from the moodboard
  const handleRemoveImage = (index) => {
    const updatedMoodboard = [...newProject.moodboard];
    updatedMoodboard.splice(index, 1);
    setNewProject({
      ...newProject,
      moodboard: updatedMoodboard,
    });
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Format budget as a number
      const formattedProject = {
        ...newProject,
        budget: parseFloat(newProject.budget),
      };

      // Add project to API
      const response = await api.addProject(formattedProject);

      // Add project to local state
      setProjects([...projects, response.data]);

      // Close modal and reset form
      setShowAddModal(false);
      setNewProject({
        title: "",
        client_id: "",
        designer_id: userId,
        status: "active",
        budget: 0,
        timeline: {
          start: new Date().toISOString().split("T")[0],
          estimated_end: "",
        },
        notes: "",
        moodboard: [],
      });
    } catch (error) {
      console.error("Error adding project:", error);
      // Here you would typically show an error message to the user
    }
  };

  if (projects.length === 0) {
    return (
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col">
            <h1 className="mb-0">Projects</h1>
            <p className="text-muted">Manage your design projects</p>
          </div>
          <div className="col-auto">
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <FiPlus className="me-2" />
              New Project
            </button>
          </div>
        </div>
        <div className="alert alert-info m-3">No projects found.</div>

        {/* Add Project Modal */}
        <AddProjectModal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          newProject={newProject}
          clients={clients}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          handleAddImage={handleAddImage}
          handleRemoveImage={handleRemoveImage}
        />
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-success";
      case "active":
        return "bg-primary";
      default:
        return "bg-secondary";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "active":
        return "In Progress";
      default:
        return "Pending";
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  const getClient = (clientId) => {
    return clients.find((c) => c.id === clientId) || { name: "Unknown Client" };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";

    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Default image if project doesn't have a moodboard
  const getProjectImage = (project) => {
    if (project.moodboard && project.moodboard.length > 0) {
      return project.moodboard[0];
    }
    return "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80";
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="mb-0">Projects</h1>
          <p className="text-muted">Manage your design projects</p>
        </div>
        <div className="col-auto">
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
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
          } else if (
            project.status === "in_progress" ||
            project.status === "active"
          ) {
            // Mock value, would be calculated based on timeline/tasks
            progress = 30;
          }

          return (
            <div key={project.id} className="col-md-6 col-lg-4">
              <div className={`card h-100 shadow-sm ${styles.projectCard}`}>
                <div className="position-relative">
                  <img
                    src={getProjectImage(project)}
                    className={`card-img-top ${styles.projectImage}`}
                    alt={project.title}
                  />
                  <span
                    className={`badge position-absolute top-0 end-0 m-2 ${getStatusBadgeClass(
                      project.status
                    )}`}
                  >
                    {getStatusLabel(project.status)}
                  </span>
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
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => handleViewDetails(project)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectDetails
          project={selectedProject}
          client={getClient(selectedProject.client_id)}
          show={showDetailsModal}
          onClose={handleCloseDetails}
        />
      )}

      {/* Add Project Modal */}
      <AddProjectModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        newProject={newProject}
        clients={clients}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        handleAddImage={handleAddImage}
        handleRemoveImage={handleRemoveImage}
      />
    </div>
  );
}

// Component for the Add Project Modal
function AddProjectModal({
  show,
  onHide,
  newProject,
  clients,
  handleInputChange,
  handleSubmit,
  imageUrl,
  setImageUrl,
  handleAddImage,
  handleRemoveImage,
}) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Project</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Project Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={newProject.title}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Client</Form.Label>
            <Form.Select
              name="client_id"
              value={newProject.client_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={newProject.status}
              onChange={handleInputChange}
            >
              <option value="active">In Progress</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Budget</Form.Label>
            <Form.Control
              type="number"
              name="budget"
              value={newProject.budget}
              onChange={handleInputChange}
              min="0"
            />
          </Form.Group>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="timeline.start"
                  value={newProject.timeline.start}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Estimated End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="timeline.estimated_end"
                  value={newProject.timeline.estimated_end}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={newProject.notes}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Moodboard Images</Form.Label>
            <div className="d-flex mb-2">
              <Form.Control
                type="text"
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Button
                variant="outline-primary"
                className="ms-2"
                onClick={handleAddImage}
              >
                <FiPlus />
              </Button>
            </div>

            <div className="d-flex flex-wrap gap-2 mt-2">
              {newProject.moodboard.map((url, index) => (
                <div
                  key={index}
                  className="position-relative"
                  style={{ width: "100px" }}
                >
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0 p-0"
                    style={{ width: "20px", height: "20px", zIndex: 1 }}
                    onClick={() => handleRemoveImage(index)}
                  >
                    <FiX size={12} />
                  </Button>
                  <img
                    src={url}
                    alt={`Moodboard ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "75px",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/100x75?text=Invalid+Image";
                    }}
                  />
                </div>
              ))}
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Create Project
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Projects;
