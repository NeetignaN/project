import { FaBars } from "react-icons/fa";
import styles from "./Header.module.css";

function Header({ setCollapsed, collapsed, username = "User" }) {
  // Get the first name from the username
  const firstName = username.split(" ")[0];

  // Get initials for the avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  const userInitials = getInitials(username);

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <button
          className={styles.hamburger}
          onClick={() => setCollapsed(!collapsed)}
        >
          <FaBars />
        </button>
        <span className={styles.logo}>Logo Name</span>
      </div>

      {/* Welcome message and avatar */}
      <div className={styles.headerRight}>
        <div className={styles.welcomeMessage}>Welcome, {firstName}!</div>
        <div className={styles.headerAvatar}>
          <div className={styles.avatarInitials}>{userInitials}</div>
        </div>
      </div>
    </header>
  );
}

export default Header;
