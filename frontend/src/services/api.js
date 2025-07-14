const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-backend-service.onrender.com/api"
    : "http://localhost:5005/api";

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

      // Since user object already contains all needed info, no need for second API call
      return {
        success: true,
        username: user.name,
        userId: user.id,
        role: role,
        details: user,
      };
    } catch (error) {
      throw error;
    }
  },

  // Register a new client (signup)
  clientSignup: async ({ email, password }) => {
    // This will PATCH the credentials entry for the client
    const response = await fetch(`${BASE_URL}/credentials`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: "client" }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Signup failed");
    }
    return await response.json();
  },

  // Register Designer
  registerDesigner: async (designerData, password) => {
    if (!designerData.id) designerData.id = `designer_${Date.now()}`;
    // 1. Create designer
    const res = await fetch(`${BASE_URL}/designers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(designerData),
    });
    if (!res.ok) throw new Error("Failed to register designer");
    // 2. Create credentials with name
    const credRes = await fetch(`${BASE_URL}/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: designerData.id,
        email: designerData.email,
        password,
        role: "designer",
        name: designerData.name, // Add name here
      }),
    });
    if (!credRes.ok) throw new Error("Failed to create designer credentials");
    return { success: true, designer: await res.json() };
  },

  // Register Vendor
  registerVendor: async (vendorData, password) => {
    if (!vendorData.id) vendorData.id = `vendor_${Date.now()}`;
    // 1. Create vendor
    const res = await fetch(`${BASE_URL}/vendors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendorData),
    });
    if (!res.ok) throw new Error("Failed to register vendor");
    // 2. Create credentials with name
    const credRes = await fetch(`${BASE_URL}/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: vendorData.id,
        email: vendorData.email,
        password,
        role: "vendor",
        name: vendorData.name, // Add name here
      }),
    });
    if (!credRes.ok) throw new Error("Failed to create vendor credentials");
    return { success: true, vendor: await res.json() };
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

          result.clients = clientsData.filter((c) => c.designer_id === userId);

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
          const [
            conversationsData,
            productsData,
            schedulesData,
            designersData,
          ] = await Promise.all([
            fetchAll("conversations"),
            fetchAll("products"),
            fetchAll("schedules"),
            fetchAll("designers"),
          ]);

          result.conversations = conversationsData.filter((c) =>
            c.participants.includes(userId)
          );
          result.products = productsData.filter((p) => p.vendor_id === userId);
          result.schedules = schedulesData.filter(
            (s) => s.vendor_id === userId
          );
          result.designers = designersData.filter((d) =>
            d.vendor_connections?.includes(userId)
          );
          console.log(result);
          break;
        }
        case "admin": {
          console.log("🔍 Admin fetching data from MongoDB...");
          const [
            credentialsData,
            designersData,
            clientsData,
            vendorsData,
            schedulesData,
            projectsData,
          ] = await Promise.all([
            fetchAll("credentials"),
            fetchAll("designers"),
            fetchAll("clients"),
            fetchAll("vendors"),
            fetchAll("schedules"),
            fetchAll("projects"),
          ]);

          result.credentials = credentialsData;
          result.designers = designersData;
          result.clients = clientsData;
          result.vendors = vendorsData;
          result.schedules = schedulesData;
          result.projects = projectsData; // Add projects for admin

          console.log("📊 Admin data loaded:", {
            credentials: credentialsData.length,
            designers: designersData.length,
            clients: clientsData.length,
            vendors: vendorsData.length,
            schedules: schedulesData.length,
            projects: projectsData.length,
          });
          console.log(
            "📝 Project IDs in admin data:",
            projectsData.map((p) => ({
              id: p.id,
              _id: p._id,
              name: p.name,
              fullProject: p, // Log full project to see structure
            }))
          );

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

  // Add a new project
  addProject: async (projectData) => {
    try {
      // Generate a unique ID if not provided
      if (!projectData.id) {
        projectData.id = `project_${Date.now()}`;
      }

      const response = await fetch(`${BASE_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error("Failed to add project");
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding project:", error);
      throw error;
    }
  },
  // Updating project details
  updateProject: async (projectId, updatedData) => {
    try {
      console.log("🔧 Attempting to update project:", projectId);
      console.log("📊 Update data:", updatedData);
      console.log("🔗 PATCH URL:", `${BASE_URL}/projects/${projectId}`);

      const response = await fetch(`${BASE_URL}/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("❌ Update failed with error data:", errorData);
        throw new Error(
          errorData.error || `Failed to update project (${response.status})`
        );
      }

      const result = await response.json();
      console.log("✅ Project updated successfully:", result);
      
      // Return the updated project data - handle different response formats
      return result.data || result || updatedData;
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  },// Delete a project by ID
  deleteProject: async (projectId) => {
    try {
      console.log("🗑️ Attempting to delete project with ID:", projectId);
      console.log("🔗 DELETE URL:", `${BASE_URL}/projects/${projectId}`);

      const response = await fetch(`${BASE_URL}/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Get the error message from the backend
        const errorData = await response.json();
        console.log("❌ Delete failed with error data:", errorData);
        throw new Error(
          errorData.error || `Failed to delete project (${response.status})`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  },

  // Add a new client (designer invites client)
  addClient: async (clientData) => {
    try {
      // Generate a unique ID if not provided
      if (!clientData.id) {
        clientData.id = `client_${Date.now()}`;
      }

      console.log(clientData);

      // 1. Add client to clients collection
      const response = await fetch(`${BASE_URL}/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        throw new Error("Failed to add client");
      }
      const clientRes = await response.json();
      const client = clientRes.data; // <-- get the actual client object

      // 2. Add client to credentials collection (without password)
      // Only add if not already present
      const credRes = await fetch(`${BASE_URL}/credentials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: client.id,
          email: client.email,
          name: client.name,
          role: "client",
          // No password at this stage
        }),
      });

      // It's OK if already exists (409), but throw for other errors
      if (!credRes.ok && credRes.status !== 409) {
        throw new Error("Failed to add client credentials");
      }

      return client;
    } catch (error) {
      console.error("Error adding client:", error);
      throw error;
    }
  },

  // Update designer vendor connections
  addVendorConnection: async (designerId, vendorId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/designers/${designerId}/vendor-connections`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ vendorId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update vendor connection");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating vendor connection:", error);
      throw error;
    }
  },

  // Get all available vendors (for the add vendor modal)
  getAllVendors: async () => {
    try {
      const response = await fetch(`${BASE_URL}/vendors`);

      if (!response.ok) {
        throw new Error("Failed to fetch vendors");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching vendors:", error);
      throw error;
    }
  },
  // Delete a designer by ID
  deleteDesigner: async (designerId) => {
    try {
      const response = await fetch(`${BASE_URL}/designers/${designerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to delete designer (${response.status})`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting designer:", error);
      throw error;
    }
  },

  // Delete a vendor by ID
  deleteVendor: async (vendorId) => {
    try {
      const response = await fetch(`${BASE_URL}/vendors/${vendorId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to delete vendor (${response.status})`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting vendor:", error);
      throw error;
    }
  },

  // Delete a client by ID
  deleteClient: async (clientId) => {
    try {
      const response = await fetch(`${BASE_URL}/clients/${clientId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to delete client (${response.status})`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting client:", error);
      throw error;
    }
  },

  addSchedule: async (scheduleData) => {
    try {
      const response = await fetch(`${BASE_URL}/schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData),
      });
      if (!response.ok) {
        throw new Error("Failed to add schedule");
      }
      return await response.json();
    } catch (error) {
      console.error("Error adding schedule:", error);
      throw error;
    }
  },

  updateSchedule: async (scheduleId, updatedData) => {
    try {
      const response = await fetch(`${BASE_URL}/schedules/${scheduleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error("Failed to update schedule");
      }
      return await response.json();
    } catch (error) {
      console.error("Error updating schedule:", error);
      throw error;
    }
  },
  deleteSchedule: async (scheduleId) => {
    try {
      const response = await fetch(`${BASE_URL}/schedules/${scheduleId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete schedule");
      }
      return await response.json();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      throw error;
    }
  },

  // Add a new product
  addProduct: async (productData) => {
    try {
      // Generate a unique ID if not provided
      if (!productData.id) {
        productData.id = `product_${Date.now()}`;
      }

      console.log("🔧 Attempting to add product:", productData);

      const response = await fetch(`${BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("❌ Add product failed with error data:", errorData);
        throw new Error(
          errorData.error || `Failed to add product (${response.status})`
        );
      }

      const result = await response.json();
      console.log("✅ Product added successfully:", result);
      return result;
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  },

  // Update product details
  updateProduct: async (productId, updatedData) => {
    try {
      console.log("🔧 Attempting to update product:", productId);
      console.log("📊 Update data:", updatedData);
      console.log("🔗 PATCH URL:", `${BASE_URL}/products/${productId}`);

      const response = await fetch(`${BASE_URL}/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("❌ Update failed with error data:", errorData);
        throw new Error(
          errorData.error || `Failed to update product (${response.status})`
        );
      }

      const result = await response.json();
      console.log("✅ Product updated successfully:", result);
      
      // Return the updated product data - handle different response formats
      return result.data || result || updatedData;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  // Delete a product by ID
  deleteProduct: async (productId) => {
    try {
      console.log("🗑️ Attempting to delete product with ID:", productId);
      console.log("🔗 DELETE URL:", `${BASE_URL}/products/${productId}`);

      const response = await fetch(`${BASE_URL}/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("❌ Delete failed with error data:", errorData);
        throw new Error(
          errorData.error || `Failed to delete product (${response.status})`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },
  addMessageToConversation: async (conversationId, messageObj) => {
    try {
      console.log("💬 Attempting to add message to conversation:", conversationId);
      console.log("📝 Message data:", messageObj);
      console.log("🔗 PATCH URL:", `${BASE_URL}/conversations/${conversationId}/messages`);

      const response = await fetch(
        `${BASE_URL}/conversations/${conversationId}/messages`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messageObj),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.log("❌ Add message failed with error data:", errorData);
        throw new Error(
          errorData.error || `Failed to add message (${response.status})`
        );
      }

      const result = await response.json();
      console.log("✅ Message added successfully:", result);
      return result;
    } catch (error) {
      console.error("Error adding message:", error);
      throw error;
    }
  },  updateDesigner: async (designerId, updatedData) => {
    try {
      console.log("🔧 Attempting to update designer:", designerId);
      console.log("📊 Update data:", updatedData);
      console.log("🔗 PATCH URL:", `${BASE_URL}/designers/${designerId}`);

      // 1. Update designer in designers collection
      const response = await fetch(`${BASE_URL}/designers/${designerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("❌ Update failed with error data:", errorData);
        throw new Error(
          errorData.error || `Failed to update designer (${response.status})`
        );
      }

      const designerResult = await response.json();
      console.log("✅ Designer updated successfully in designers collection:", designerResult);

      // 2. Update designer in credentials collection (if name or email changed)
      const credentialUpdates = {};
      if (updatedData.name) credentialUpdates.name = updatedData.name;
      if (updatedData.email) credentialUpdates.email = updatedData.email;

      if (Object.keys(credentialUpdates).length > 0) {
        console.log("🔧 Also updating credentials for designer:", designerId);
        console.log("📊 Credential updates:", credentialUpdates);
        console.log("🔗 Credentials PATCH URL:", `${BASE_URL}/credentials/${designerId}`);

        const credResponse = await fetch(
          `${BASE_URL}/credentials/${designerId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentialUpdates),
          }
        );

        if (!credResponse.ok) {
          const credErrorData = await credResponse.json();
          console.log("❌ Credentials update failed with error data:", credErrorData);
          console.log("⚠️ Warning: Failed to update designer credentials, but designer updated successfully");
          // Don't throw error here - designer update succeeded
        } else {
          const credResult = await credResponse.json();
          console.log("✅ Designer credentials updated successfully:", credResult);
        }
      } else {
        console.log("ℹ️ No credential updates needed (name/email not changed)");
      }

      return designerResult;
    } catch (error) {
      console.error("Error updating designer:", error);
      throw error;
    }
  },updateVendor: async (vendorId, updatedData) => {
    try {
      console.log("🔧 Attempting to update vendor:", vendorId);
      console.log("📊 Update data:", updatedData);
      console.log("🔗 PATCH URL:", `${BASE_URL}/vendors/${vendorId}`);

      // 1. Update vendor in vendors collection
      const response = await fetch(`${BASE_URL}/vendors/${vendorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("❌ Update failed with error data:", errorData);
        throw new Error(
          errorData.error || `Failed to update vendor (${response.status})`
        );
      }

      const vendorResult = await response.json();
      console.log("✅ Vendor updated successfully in vendors collection:", vendorResult);

      // 2. Update vendor in credentials collection (if name or email changed)
      const credentialUpdates = {};
      if (updatedData.name) credentialUpdates.name = updatedData.name;
      if (updatedData.email) credentialUpdates.email = updatedData.email;

      if (Object.keys(credentialUpdates).length > 0) {
        console.log("🔧 Also updating credentials for vendor:", vendorId);
        console.log("📊 Credential updates:", credentialUpdates);
        console.log("🔗 Credentials PATCH URL:", `${BASE_URL}/credentials/${vendorId}`);

        const credResponse = await fetch(
          `${BASE_URL}/credentials/${vendorId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentialUpdates),
          }
        );

        if (!credResponse.ok) {
          const credErrorData = await credResponse.json();
          console.log("❌ Credentials update failed with error data:", credErrorData);
          console.log("⚠️ Warning: Failed to update vendor credentials, but vendor updated successfully");
          // Don't throw error here - vendor update succeeded
        } else {
          const credResult = await credResponse.json();
          console.log("✅ Vendor credentials updated successfully:", credResult);
        }
      } else {
        console.log("ℹ️ No credential updates needed (name/email not changed)");
      }

      return vendorResult;
    } catch (error) {
      console.error("Error updating vendor:", error);
      throw error;
    }
  },  updateClient: async (clientId, updatedData) => {
    try {
      console.log("🔧 Attempting to update client:", clientId);
      console.log("📊 Update data:", updatedData);
      console.log("🔗 PATCH URL:", `${BASE_URL}/clients/${clientId}`);

      // 1. Update client in clients collection
      const response = await fetch(`${BASE_URL}/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("❌ Update failed with error data:", errorData);
        throw new Error(
          errorData.error || `Failed to update client (${response.status})`
        );
      }

      const clientResult = await response.json();
      console.log("✅ Client updated successfully in clients collection:", clientResult);

      // 2. Update client in credentials collection (if name or email changed)
      const credentialUpdates = {};
      if (updatedData.name) credentialUpdates.name = updatedData.name;
      if (updatedData.email) credentialUpdates.email = updatedData.email;

      if (Object.keys(credentialUpdates).length > 0) {
        console.log("🔧 Also updating credentials for client:", clientId);
        console.log("📊 Credential updates:", credentialUpdates);
        console.log("🔗 Credentials PATCH URL:", `${BASE_URL}/credentials/${clientId}`);

        const credResponse = await fetch(
          `${BASE_URL}/credentials/${clientId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentialUpdates),
          }
        );

        if (!credResponse.ok) {
          const credErrorData = await credResponse.json();
          console.log("❌ Credentials update failed with error data:", credErrorData);
          console.log("⚠️ Warning: Failed to update client credentials, but client updated successfully");
          // Don't throw error here - client update succeeded
        } else {
          const credResult = await credResponse.json();
          console.log("✅ Client credentials updated successfully:", credResult);
        }
      } else {
        console.log("ℹ️ No credential updates needed (name/email not changed)");
      }

      return clientResult;
    } catch (error) {
      console.error("Error updating client:", error);
      throw error;
    }
  },

  // Debug function to check what projects exist
  getProjectsDebug: async () => {
    try {
      console.log("🔍 Fetching all projects from MongoDB...");
      const response = await fetch(`${BASE_URL}/projects`);

      if (!response.ok) {
        console.error("❌ Failed to fetch projects:", response.status);
        return [];
      }

      const projects = await response.json();
      console.log("📊 Projects in MongoDB:", projects);
      console.log(
        "📝 Project IDs:",
        projects.map((p) => ({ id: p.id, _id: p._id, name: p.name }))
      );

      return projects;
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
      return [];
    }
  },
};

export default api;
