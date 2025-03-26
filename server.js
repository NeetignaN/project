import express from "express";
import cors from "cors";
import api from "./src/services/api.js";

const app = express();
app.use(cors());
app.use(express.json());

// Login endpoints for different roles
app.post("/api/:role/login", async (req, res) => {
  const { role } = req.params;
  const { email, password } = req.body;

  try {
    // Use the api login method
    const userData = await api.login(email, password, role);

    res.json({
      success: true,
      username: userData.username,
      userId: userData.userId,
      role: userData.role,
      details: userData.details,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || "Invalid credentials",
    });
  }
});

// Get user data endpoint
app.get("/api/user/:userId/:role", async (req, res) => {
  const { userId, role } = req.params;

  try {
    const userData = await api.getUserData(userId, role);
    res.json(userData);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || "User data not found",
    });
  }
});

// Get resource data endpoint
app.get("/api/:resourceType/:id?", async (req, res) => {
  const { resourceType, id } = req.params;

  try {
    const data = await api.getData(resourceType, id);
    res.json(data);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || "Resource not found",
    });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
});
