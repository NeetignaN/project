import credentials from "../data/credentials.json" with { type: "json" };
import admins from "../data/admins.json" with { type: "json" };
import clients from "../data/clients.json" with { type: "json" };
import designers from "../data/designers.json" with { type: "json" };
import vendors from "../data/vendors.json" with { type: "json" };
import projects from "../data/projects.json" with { type: "json" };
import products from "../data/products.json" with { type: "json" };
import orders from "../data/orders.json" with { type: "json" };
import conversations from "../data/conversations.json" with { type: "json" };
import schedules from "../data/schedules.json" with { type: "json" };

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
        console.log(userDetails); // Debugging
        break;

      case "vendor":
        userDetails = vendors.vendors.find((v) => v.id === user.id);
        break;

      case "admin":
        userDetails = admins.admins.find((a) => a.id === user.id);
        break;

      default:
        console.log("Invalid role:", user.role);
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

  // function for getting entire data of individual json files or if  ID is mentioned then data of that partical data info is fetched
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
        data = conversations.conversations;
        break;
      case "credentials":
        data = credentials.users;
        break;
      case "schedules":
        data = id
          ? schedules.schedules.find((s) => s.id === id)
          : schedules.schedules;
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
      projects: [],
      clients: [],
      messages: [],
      orders: [],
      vendors: [],
      designers: [],
      credentials: [],
      schedules: []
    };

    switch (userRole) {
      case "designer":
        result.projects = projects.projects.filter(p => p.designer_id === userId);
        result.clients = Array.from(new Set(result.projects.map(p => p.client_id)))
          .map(clientId => clients.clients.find(c => c.id === clientId));

        result.messages = conversations.conversations.filter(c => c.participants.includes(userId));
        // console.log(result.messages);
        result.orders = orders.orders.filter(o => o.designer_id === userId);
        result.vendors = vendors.vendors.filter(v =>
          designers.designers.find(d => d.id === userId)?.vendor_connections.includes(v.id)
        );
        result.schedules = schedules.schedules.filter(s => s.designer_id === userId);
        break;

      case "client":
        result.projects = projects.projects.filter(p => p.client_id === userId);
        result.messages = conversations.conversations.filter(c => c.participants.includes(userId));
        result.schedules = schedules.schedules.filter(s => s.client_id === userId);
        break;

      case "vendor":
        result.messages = conversations.conversations.filter(c => c.participants.includes(userId));
        result.products = products.products.filter(p => p.vendor_id === userId);
        result.schedules = schedules.schedules.filter(s => s.vendor_id === userId);
        break;

      case "admin":
        result.credentials = credentials.users;
        result.designers = designers.designers;
        result.clients = clients.clients;
        result.vendors = vendors.vendors;
        result.schedules = schedules.schedules;
        break;

      default:
        throw new Error(`Invalid role: ${userRole}`);
    }
    console.log(result);
    return result;
  },

};

export default api;
