import { useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link, Outlet } from "react-router-dom";
import { FaBars } from "react-icons/fa"; // Import hamburger icon
import styles from "./DesignerLayout.module.css";

function DesignerLayout() {
  const [collapsed, setCollapsed] = useState(true);

  // Closes the sidebar when clicking outside
  const closeSidebar = (e) => {
    if (!collapsed && e.target.closest(`.${styles.sidebar}`) === null) {
      setCollapsed(true);
    }
  };

  return (
    <div className={styles.layout} onClick={closeSidebar}>
      {/* Header with Logo and Hamburger */}
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

      {/* Sidebar (Starts Below Header) */}
      <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
        <Sidebar collapsed={collapsed}>
          <Menu
            menuItemStyles={{
              button: {
                [`&.active`]: {
                  backgroundColor: "#13395e",
                  color: "#b6c8d9",
                },
              },
            }}
          >
            <MenuItem
              onClick={() => setCollapsed(true)}
              component={<Link to="/designer/dashboard" />}
            >
              Dashboard
            </MenuItem>
            <MenuItem
              onClick={() => setCollapsed(true)}
              component={<Link to="/designer/clients" />}
            >
              Clients
            </MenuItem>
            <MenuItem
              onClick={() => setCollapsed(true)}
              component={<Link to="/designer/projects" />}
            >
              Projects
            </MenuItem>
            <MenuItem
              onClick={() => setCollapsed(true)}
              component={<Link to="/designer/vendors" />}
            >
              Vendors
            </MenuItem>
          </Menu>
        </Sidebar>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}

export default DesignerLayout;
