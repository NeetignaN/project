import React, { createContext, useContext, useState, useEffect } from "react";

// Create the context
const DesignerDataContext = createContext();

// Custom hook to use the DesignerDataContext
export const useDesignerData = () => {
  const context = useContext(DesignerDataContext);
  if (!context) {
    throw new Error(
      "useDesignerData must be used within a DesignerDataProvider"
    );
  }
  return context;
};

// Provider component
export const DesignerDataProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  // Safely parse data from localStorage
  const safeParse = (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      return [];
    }
  };

  // Initialize data from localStorage when the provider is mounted
  useEffect(() => {
    const storedProjects = safeParse("projects");
    const storedClients = safeParse("clients");

    if (storedProjects.length > 0) {
      setProjects(storedProjects);
      console.log("Initialized Projects from localStorage:", storedProjects);
    }

    if (storedClients.length > 0) {
      setClients(storedClients);
      console.log("Initialized Clients from localStorage:", storedClients);
    }
  }, []);

  // Sync data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
    console.log("Updated Projects in localStorage:", projects);
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("clients", JSON.stringify(clients));
    console.log("Updated Clients in localStorage:", clients);
  }, [clients]);

  return (
    <DesignerDataContext.Provider
      value={{ projects, setProjects, clients, setClients }}
    >
      {children}
    </DesignerDataContext.Provider>
  );
};
