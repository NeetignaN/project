import credentials from "../data/credentials.json" assert { type: "json" };
import admins from "../data/admins.json" assert { type: "json" };
import clients from "../data/clients.json" assert { type: "json" };
import designers from "../data/designers.json" assert { type: "json" };
import vendors from "../data/vendors.json" assert { type: "json" };
import projects from "../data/projects.json" assert { type: "json" };
import products from "../data/products.json" assert { type: "json" };
import orders from "../data/orders.json" assert { type: "json" };
import messages from "../data/messages.json" assert { type: "json" };

// Simulated delay to mimic real API calls
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// API service
const api = {
  // Authentication
  login: async function (email, password, role) {
    await delay(500); // Simulate network delay

    const user = credentials.users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password &&
        (role === "any" || u.role === role)
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Get more user details based on role
    let userDetails = null;

    switch (user.role) {
      case "client":
        userDetails = clients.clients.find((c) => c.id === user.id);
        break;
      case "designer":
        userDetails = designers.designers.find((d) => d.id === user.id);
        break;
      case "vendor":
        userDetails = vendors.vendors.find((v) => v.id === user.id);
        break;
      case "admin":
        userDetails = admins.admins.find((a) => a.id === user.id);
        break;
      default:
        break;
    }

    return {
      success: true,
      username: user.name,
      userId: user.id,
      role: user.role,
      details: userDetails,
    };
  },

  // Get data based on resource type
  getData: async (resourceType, id = null) => {
    await delay(300); // Simulate network delay

    let data;

    switch (resourceType) {
      case "clients":
        data = id ? clients.clients.find((c) => c.id === id) : clients.clients;
        break;
      case "designers":
        data = id
          ? designers.designers.find((d) => d.id === id)
          : designers.designers;
        break;
      case "vendors":
        data = id ? vendors.vendors.find((v) => v.id === id) : vendors.vendors;
        break;
      case "admins":
        data = id ? admins.admins.find((a) => a.id === id) : admins.admins;
        break;
      case "projects":
        data = id
          ? projects.projects.find((p) => p.id === id)
          : projects.projects;
        break;
      case "products":
        data = id
          ? products.products.find((p) => p.id === id)
          : products.products;
        break;
      case "productCategories":
        data = products.product_categories;
        break;
      case "orders":
        data = id ? orders.orders.find((o) => o.id === id) : orders.orders;
        break;
      case "payments":
        data = orders.payments;
        break;
      case "conversations":
        data = messages.conversations;
        break;
      default:
        throw new Error(`Unknown resource type: ${resourceType}`);
    }

    if (id && !data) {
      throw new Error(`Resource not found: ${resourceType} with id ${id}`);
    }

    return data;
  },

  // Get data related to a specific user
  getUserData: async (userId, userRole) => {
    await delay(300); // Simulate network delay

    const result = {
      user: null,
      projects: [],
      orders: [],
      conversations: [],
    };

    // Get user details
    switch (userRole) {
      case "client":
        result.user = clients.clients.find((c) => c.id === userId);
        if (result.user) {
          result.projects = projects.projects.filter(
            (p) => p.client_id === userId
          );
        }
        break;
      case "designer":
        result.user = designers.designers.find((d) => d.id === userId);
        if (result.user) {
          result.projects = projects.projects.filter(
            (p) => p.designer_id === userId
          );
        }
        break;
      case "vendor":
        result.user = vendors.vendors.find((v) => v.id === userId);
        break;
      case "admin":
        result.user = admins.admins.find((a) => a.id === userId);
        break;
      default:
        break;
    }

    if (!result.user) {
      throw new Error(`User not found: ${userId} with role ${userRole}`);
    }

    // Get user orders
    result.orders = orders.orders.filter((o) => {
      if (userRole === "client") return o.client_id === userId;
      if (userRole === "designer") return o.designer_id === userId;
      if (userRole === "vendor") return o.vendor_id === userId;
      return false; // Admins don't have specific orders
    });

    // Get user conversations
    result.conversations = messages.conversations.filter((c) =>
      c.participants.includes(userId)
    );

    return result;
  },
};

export default api;
