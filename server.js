// server.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import { ObjectId } from "mongodb";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const client = new MongoClient(process.env.MONGO_URI);

app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
  }
}
connectDB();

// Collections array
const collections = [
  "projects",
  "admins",
  "clients",
  "conversations",
  "credentials",
  "designers",
  "orders",
  "payments",
  "productCategories",
  "products",
  "schedules",
  "tests",
  "users",
  "vendors",
];

// Auto-generate routes
collections.forEach((collectionName) => {
  app.get(`/${collectionName}`, async (req, res) => {
    try {
      const db = client.db("Interiora");
      const data = await db.collection(collectionName).find({}).toArray();
      res.json(data);
    } catch (err) {
      console.error(`❌ Error fetching ${collectionName}:`, err);
      res.status(500).json({ error: `Error fetching ${collectionName}` });
    }
  });

  // Add POST routes for each collection
  app.post(`/${collectionName}`, async (req, res) => {
    try {
      const db = client.db("Interiora");
      const result = await db.collection(collectionName).insertOne(req.body);
      res.status(201).json({
        success: true,
        message: `${collectionName} created successfully`,
        id: req.body.id,
        data: req.body,
      });
    } catch (err) {
      console.error(`❌ Error creating ${collectionName}:`, err);
      res.status(500).json({ error: `Error creating ${collectionName}` });
    }
  });
});

// Default route
app.get("/", (req, res) => {
  res.send("🚀 Welcome to the Interiora API!");
});

// Add a new client (designer invites client)
app.post("/clients", async (req, res) => {
  const db = client.db("Interiora");
  const clientData = req.body;

  // Generate a unique ID if not provided
  if (!clientData.id) {
    clientData.id = "client_" + Date.now();
  }

  // Insert client into clients collection
  await db.collection("clients").insertOne(clientData);

  // Try to add to credentials (ignore duplicate error)
  try {
    await db.collection("credentials").insertOne({
      id: clientData.id,
      email: clientData.email,
      name: clientData.name,
      role: "client",
      // No password at this stage
    });
  } catch (err) {
    // If duplicate key error (already exists), ignore
    if (err.code !== 11000) {
      return res
        .status(500)
        .json({ error: "Failed to add client credentials" });
    }
  }

  res.status(201).json({ data: clientData });
});

// Add a new credentials entry
app.post("/credentials", async (req, res) => {
  const db = client.db("Interiora");
  const { id, email, name, role, password } = req.body;

  if (!id || !email || !role) {
    return res.status(400).json({ error: "id, email, and role are required" });
  }

  // Check if credentials already exist for this email and role
  const existing = await db.collection("credentials").findOne({ email, role });
  if (existing) {
    return res.status(409).json({ error: "Credentials already exist" });
  }

  // Insert credentials (password is optional)
  await db.collection("credentials").insertOne({
    id,
    email,
    name,
    role,
    ...(password ? { password } : {}),
  });

  res.status(201).json({ success: true, message: "Credentials created" });
});

app.patch("/credentials", async (req, res) => {
  const { email, password, role } = req.body;
  const db = client.db("Interiora");
  if (!email || !password || !role) {
    return res
      .status(400)
      .json({ error: "Email, password, and role are required" });
  }
  const cred = await db.collection("credentials").findOne({ email, role });
  if (!cred) {
    return res
      .status(400)
      .json({ error: "You are not invited. Contact your designer." });
  }
  if (cred.password) {
    return res
      .status(400)
      .json({ error: "Account already exists. Please login." });
  }
  await db
    .collection("credentials")
    .updateOne({ email, role }, { $set: { password } });
  res.json({ success: true });
});

// Role-based user fetch
app.get("/users/:role/:userId", async (req, res) => {
  const { role, userId } = req.params;
  const db = client.db("Interiora");

  try {
    const result = await db.collection(`${role}s`).findOne({ id: userId });
    if (!result) return res.status(404).json({ error: "User not found" });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Generic resource fetch
app.get("/resources/:resourceType/:id", async (req, res) => {
  const { resourceType, id } = req.params;

  if (!collections.includes(resourceType)) {
    return res
      .status(404)
      .json({ error: `Collection '${resourceType}' not found` });
  }

  try {
    const db = client.db("Interiora");
    const doc = await db.collection(resourceType).findOne({ id: id });
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update designer vendor connections
app.patch("/designers/:designerId/vendor-connections", async (req, res) => {
  const { designerId } = req.params;
  const { vendorId } = req.body;

  if (!designerId || !vendorId) {
    return res
      .status(400)
      .json({ error: "Designer ID and Vendor ID are required" });
  }

  try {
    const db = client.db("Interiora");
    const designer = await db
      .collection("designers")
      .findOne({ id: designerId });

    if (!designer) {
      return res.status(404).json({ error: "Designer not found" });
    }

    // Make sure vendor_connections is an array
    const vendorConnections = designer.vendor_connections || [];

    // Add the vendor ID if it doesn't already exist
    if (!vendorConnections.includes(vendorId)) {
      const result = await db
        .collection("designers")
        .updateOne(
          { id: designerId },
          { $push: { vendor_connections: vendorId } }
        );

      return res.json({
        success: true,
        message: "Vendor connection added successfully",
      });
    } else {
      return res.json({
        success: false,
        message: "Vendor already connected",
      });
    }
  } catch (err) {
    console.error("❌ Error updating vendor connections:", err);
    res.status(500).json({ error: "Error updating vendor connections" });
  }
});

// Helper to recursively remove all _id fields
function removeMongoId(obj) {
  if (Array.isArray(obj)) {
    return obj.map(removeMongoId);
  } else if (obj && typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      if (key !== "_id") {
        newObj[key] = removeMongoId(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

app.patch("/projects/:id", async (req, res) => {
  const { id } = req.params;
  let updateData = removeMongoId(req.body);

  try {
    const db = client.db("Interiora");
    const result = await db
      .collection("projects")
      .updateOne({ id: id }, { $set: updateData });

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Project not found or no change" });
    }

    const updated = await db.collection("projects").findOne({ id });
    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating project:", err);
    res.status(500).json({ error: "Error updating project" });
  }
});

app.delete("/projects/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = client.db("Interiora");
    const result = await db.collection("projects").deleteOne({ id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json({ success: true, message: "Project deleted" });
  } catch (err) {
    console.error("❌ Error deleting project:", err);
    res.status(500).json({ error: "Error deleting project" });
  }
});

// Delete a designer by ID
app.delete("/designers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = client.db("Interiora");
    const result = await db.collection("designers").deleteOne({ id: id });
    await db.collection("credentials").deleteOne({ id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Designer not found" });
    }
    res.json({ success: true, message: "Designer deleted" });
  } catch (err) {
    console.error("❌ Error deleting designer:", err);
    res.status(500).json({ error: "Error deleting designer" });
  }
});

// Delete a vendor by ID
app.delete("/vendors/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = client.db("Interiora");
    const result = await db.collection("vendors").deleteOne({ id: id });
    await db.collection("credentials").deleteOne({ id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.json({ success: true, message: "Vendor deleted" });
  } catch (err) {
    console.error("❌ Error deleting vendor:", err);
    res.status(500).json({ error: "Error deleting vendor" });
  }
});

// Delete a client by ID
app.delete("/clients/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = client.db("Interiora");
    const result = await db.collection("clients").deleteOne({ id: id });
    await db.collection("credentials").deleteOne({ id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.json({ success: true, message: "Client deleted" });
  } catch (err) {
    console.error("❌ Error deleting client:", err);
    res.status(500).json({ error: "Error deleting client" });
  }
});

app.post("/projects", async (req, res) => {
  const db = client.db("Interiora");
  const projectData = req.body;
  if (!projectData.id) {
    projectData.id = "project_" + Date.now();
  }
  await db.collection("projects").insertOne(projectData);

  // Add project ID to the client's projects array
  if (projectData.client_id) {
    await db
      .collection("clients")
      .updateOne(
        { id: projectData.client_id },
        { $addToSet: { projects: projectData.id } }
      );
  }

  res.status(201).json({ data: projectData });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
