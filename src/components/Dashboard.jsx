import React, { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import api from "../services/api";

function Dashboard({ username, role, userId, onLogout }) {
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
        <h1>Dashboard</h1>
        <div className={styles.userInfo}>
          <span>
            Welcome, {username} ({role})
          </span>
          <button className={styles.logoutButton} onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className={styles.content}>
        {loading ? (
          <p>Loading user data...</p>
        ) : (
          <div>
            <h2>Your Information</h2>
            {userData && (
              <div className={styles.userDataSection}>
                {userData.user && (
                  <div className={styles.userDetails}>
                    <h3>Profile</h3>
                    <p>Name: {userData.user.name}</p>
                    <p>Email: {userData.user.email}</p>
                  </div>
                )}

                {userData.projects && userData.projects.length > 0 && (
                  <div className={styles.projectsList}>
                    <h3>Your Projects ({userData.projects.length})</h3>
                    <ul>
                      {userData.projects.map((project) => (
                        <li key={project.id}>{project.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {userData.orders && userData.orders.length > 0 && (
                  <div className={styles.ordersList}>
                    <h3>Your Orders ({userData.orders.length})</h3>
                    <ul>
                      {userData.orders.map((order) => (
                        <li key={order.id}>{order.product_name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
