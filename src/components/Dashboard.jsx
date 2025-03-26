import React from 'react';
import { User } from 'lucide-react';
import styles from './Dashboard.module.css';

function Dashboard({ username, role }) {
  return (
    <div className={styles.container}>
      <div className={styles.welcome}>
        <h1 className={styles.title}>
          <User className={styles.icon} />
          Welcome back, {username}!
        </h1>
        <p className={styles.subtitle}>You are logged in as: {role}</p>
      </div>
    </div>
  );
}

export default Dashboard;
