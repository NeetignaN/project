import React, { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import api from "../services/api";

function Dashboard({ username, role, userId }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUserData = async () => {
      try {
        if (userId) {
          const data = await api.getUserData(userId, role);
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, role]);

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h2>Dashboard</h2>
        <div className={styles.userInfo}>
          <p>
            Here's an overview of your interios design projects and clients.
          </p>
        </div>
      </header>
    </div>
  );
}

export default Dashboard;
