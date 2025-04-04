const BASE_URL = "http://localhost:5005";

const api = {
  login: async (email, password, role) => {
    try {
      const res = await fetch(`${BASE_URL}/credentials`);
      const credentials = await res.json();
      // console.log(`${role} from api login`);

      const user = credentials.find(
        (u) => u.email === email && u.password === password && u.role === role
      );

      if (!user) {
        throw new Error("Invalid email or password");
      }

      const userId = user.id;

      // Updated path for role-based user details
      const detailsRes = await fetch(`${BASE_URL}/users/${role}/${userId}`);
      if (!detailsRes.ok) {
        throw new Error("User details not found");
      }

      const details = await detailsRes.json();

      return {
        success: true,
        username: details.name,
        userId: details.id,
        role: role,
        details: details,
      };
    } catch (error) {
      throw error;
    }
  },

  getData: async (resourceType, id = "") => {
    // Updated path for generic resource
    const path = id
      ? `${BASE_URL}/resources/${resourceType}/${id}`
      : `${BASE_URL}/${resourceType}`;

    const res = await fetch(path);
    if (!res.ok) {
      throw new Error("Resource not found");
    }
    return await res.json();
  },

  getUserData: async (userId, userRole) => {
    const result = {
      credentials: [],
      projects: [],
      clients: [],
      vendors: [],
      conversations: [],
      schedules: [],
      designers: [],
      orders: [],
      products: [],
    };

    const fetchAll = async (endpoint) => {
      const res = await fetch(`${BASE_URL}/${endpoint}`);
      if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
      return await res.json();
    };

    try {
      switch (userRole) {
        case "designer": {
          const [
            projectsData,
            clientsData,
            vendorsData,
            designersData,
            conversationsData,
            schedulesData,
            ordersData,
          ] = await Promise.all([
            fetchAll("projects"),
            fetchAll("clients"),
            fetchAll("vendors"),
            fetchAll("designers"),
            fetchAll("conversations"),
            fetchAll("schedules"),
            fetchAll("orders"),
          ]);

          result.projects = projectsData.filter(
            (p) => p.designer_id === userId
          );

          const uniqueClientIds = [
            ...new Set(result.projects.map((p) => p.client_id)),
          ];
          result.clients = uniqueClientIds.map((cid) =>
            clientsData.find((c) => c.id === cid)
          );

          const currentDesigner = designersData.find((d) => d.id === userId);
          result.vendors = vendorsData.filter((v) =>
            currentDesigner?.vendor_connections?.includes(v.id)
          );

          result.conversations = conversationsData.filter((c) =>
            c.participants.includes(userId)
          );
          result.orders = ordersData.filter((o) => o.designer_id === userId);
          result.schedules = schedulesData.filter(
            (s) => s.designer_id === userId
          );
          break;
        }

        case "client": {
          const [
            projectsData,
            conversationsData,
            schedulesData,
            designersData,
          ] = await Promise.all([
            fetchAll("projects"),
            fetchAll("conversations"),
            fetchAll("schedules"),
            fetchAll("designers"),
          ]);

          result.projects = projectsData.filter((p) => p.client_id === userId);
          result.conversations = conversationsData.filter((c) =>
            c.participants.includes(userId)
          );
          result.schedules = schedulesData.filter(
            (s) => s.client_id === userId
          );
          const uniqueDesignerIds = [
            ...new Set(result.projects.map((p) => p.designer_id)),
          ];
          result.designers = uniqueDesignerIds.map((did) =>
            designersData.find((c) => c.id === did)
          );
          break;
        }

        case "vendor": {
          const [conversationsData, productsData, schedulesData] =
            await Promise.all([
              fetchAll("conversations"),
              fetchAll("products"),
              fetchAll("schedules"),
            ]);

          result.conversations = conversationsData.filter((c) =>
            c.participants.includes(userId)
          );
          result.products = productsData.filter((p) => p.vendor_id === userId);
          result.schedules = schedulesData.filter(
            (s) => s.vendor_id === userId
          );
          console.log(result);
          break;
        }

        case "admin": {
          const [
            credentialsData,
            designersData,
            clientsData,
            vendorsData,
            schedulesData,
          ] = await Promise.all([
            fetchAll("credentials"),
            fetchAll("designers"),
            fetchAll("clients"),
            fetchAll("vendors"),
            fetchAll("schedules"),
          ]);

          result.credentials = credentialsData;
          result.designers = designersData;
          result.clients = clientsData;
          result.vendors = vendorsData;
          result.schedules = schedulesData;
          break;
        }

        default:
          throw new Error(`Invalid role: ${userRole}`);
      }

      console.log(result);
      return result;
    } catch (err) {
      console.error("❌ Error in getUserData:", err);
      throw err;
    }
  },
};

export default api;
