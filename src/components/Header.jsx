import { FaBars } from "react-icons/fa";
import styles from "./Header.module.css";
function Header({ setCollapsed, collapsed }) {
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
    </header>
  );
}

export default Header;
