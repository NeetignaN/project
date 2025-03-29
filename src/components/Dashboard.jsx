import React, { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import api from "../services/api.js";
import {
  FiUser,
  FiPlus,
  FiUsers,
  FiCalendar,
  FiBarChart2,
  FiClock,
} from "react-icons/fi";
import SummaryCard from "./SummaryCard";

function Dashboard({ username, role, userId }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUserData = async () => {
      try {
        if (userId) {
          // Fetch user-specific data
          const data = await api.getUserData(userId, role);
          setUserData(data);

          // Fetch projects data
          const projectsData = await api.getData("projects");
          setProjects(projectsData);

          // Fetch clients data
          const clientsData = await api.getData("clients");
          setClients(clientsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, role]);

  // Calculate summary statistics
  const projectCount = projects?.length || 0;
  const clientCount = clients?.length || 0;
  const upcomingDeadlines =
    projects?.filter(
      (project) =>
        project.status === "in_progress" && project.timeline?.estimated_end
    ).length || 0;
  const monthlyAppointments = 18; // This would be calculated from actual data

  // Filter active projects
  const activeProjects = projects?.slice(0, 4) || [];

  // Filter recent clients
  const recentClients = clients?.slice(0, 4) || [];

  if (loading) {
    return <div className={styles.loading}>Loading dashboard...</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <div className={styles.headerTitle}>
          <h1>Dashboard</h1>
          <p>
            Welcome back, {username}! Here's an overview of your projects and
            clients.
          </p>
        </div>
      </header>
      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <SummaryCard
          className={styles.card}
          value={15}
          heading={"Projects"}
          bgColor={"--projects-bg-color"}
        >
          <FiBarChart2 style={{ color: "var(--projects-color)" }} />
        </SummaryCard>
        <SummaryCard
          value={5}
          heading={"Clients"}
          bgColor={"--clients-bg-color"}
        >
          <FiUsers style={{ color: "var(--clients-color)" }} />
        </SummaryCard>
        <SummaryCard
          value={10}
          heading={"Upcoming Deadlines"}
          bgColor={"--deadlines-bg-color"}
        >
          <FiCalendar style={{ color: "var(--deadlines-color)" }} />
        </SummaryCard>
        <SummaryCard
          value={17}
          heading={"Monthly Appointments"}
          bgColor={"--appointments-bg-color"}
        >
          <FiClock style={{ color: "var(--appointments-color)" }} />
        </SummaryCard>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button className={styles.newProjectBtn}>
          <FiPlus />
          New Project
        </button>
        <button className={styles.addClientBtn}>
          <FiUser />
          Add Client
        </button>
      </div>

      {/* Active Projects Section */}
      <section className={styles.projectsSection}>
        <div className={styles.sectionHeader}>
          <h2>Active Projects</h2>
          <a href="#" className={styles.viewAll}>
            View All Projects
          </a>
        </div>
        <div className={styles.projectCards}>
          {activeProjects.map((project) => {
            // Calculate progress percentage
            let progress = 0;
            let statusClass = "";

            if (project.status === "completed") {
              progress = 100;
              statusClass = styles.completed;
            } else if (project.status === "in_progress") {
              progress = 30; // Mock value, would be calculated based on timeline or tasks
              statusClass = styles.inProgress;
            } else {
              statusClass = styles.pending;
            }

            // Find client name
            const client = clients.find((c) => c.id === project.client_id);
            const clientName = client ? client.name : "Unknown Client";

            // Format date
            const date = project.timeline?.start
              ? new Date(project.timeline.start).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "";

            return (
              <div
                key={project.id}
                className={`${styles.projectCard} ${statusClass}`}
              >
                <h3>{project.title}</h3>
                <div className={styles.projectStatus}>
                  {project.status === "completed"
                    ? "Completed"
                    : project.status === "in_progress"
                    ? "In Progress"
                    : "Pending"}
                </div>
                <div className={styles.projectMeta}>
                  <div className={styles.projectClient}>
                    Client: {clientName}
                  </div>
                </div>
                <div className={styles.progressWrapper}>
                  <div className={styles.progressLabel}>Progress</div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className={styles.progressPercent}>{progress}%</div>
                </div>
                <div className={styles.projectFooter}>
                  <div className={styles.projectDate}>{date}</div>
                  <a href="#" className={styles.detailsBtn}>
                    Details
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {/* Recent Clients Section */}
      <section className={styles.clientsSection}>
        <div className={styles.sectionHeader}>
          <h2>Recent Clients</h2>
          <a href="#" className={styles.viewAll}>
            View All Clients
          </a>
        </div>
        <div className={styles.clientCards}>
          {recentClients.map((client) => {
            const initials = client.name
              .split(" ")
              .map((name) => name[0])
              .join("")
              .toUpperCase();

            return (
              <div key={client.id} className={styles.clientCard}>
                <div className={styles.clientHeader}>
                  <div className={styles.clientInitials}>{initials}</div>
                  <div className={styles.clientInfo}>
                    <h3>{client.name}</h3>
                    <div className={styles.clientType}>Project</div>
                  </div>
                </div>
                <div className={styles.clientContact}>
                  <div className={styles.clientEmail}>{client.email}</div>
                  <div className={styles.clientPhone}>
                    {client.phone || "(555) 123-4567"}
                  </div>
                  <div className={styles.clientLocation}>
                    {client.company?.address?.split(",").pop() ||
                      "New York, NY"}
                  </div>
                </div>
                <div className={styles.clientFooter}>
                  <a href="#" className={styles.viewDetailsBtn}>
                    View Details
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
