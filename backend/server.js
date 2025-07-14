import dotenv from "dotenv";
import express from "express";
import cors from "cors";

// Import configuration and middleware
import database from "./config/database.js";
import errorHandler from "./middleware/errorHandler.js";
import requestLogger from "./middleware/requestLogger.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Welcome to the Interiora API!",
    version: "2.0.0",
    architecture: "MVC",
    endpoints: {
      auth: "/api/auth",
      otp: "/api/otp",
      collections: "/api",
    },
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api", apiRoutes);

// Backward compatibility routes (keeping old endpoints)
app.use("/", apiRoutes);
app.use("/", otpRoutes);

// Error handling middleware (should be last)
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Connect to database
    await database.connect();

    // Start server
    app.listen(port, () => {
      //       console.log(`
      // ╔════════════════════════════════════════╗
      // ║        🚀 INTERIORA API SERVER        ║
      // ║                                        ║
      // ║  Architecture: MVC Pattern             ║
      // ║  Port: ${port}                            ║
      // ║  Environment: ${process.env.NODE_ENV || "development"}              ║
      // ║  Database: MongoDB Connected ✅        ║
      // ║                                        ║
      // ║  API Endpoints:                        ║
      // ║  • GET  /                              ║
      // ║  • POST /api/auth/login                ║
      // ║  • POST /api/auth/register             ║
      // ║  • POST /api/otp/send-otp              ║
      // ║  • POST /api/otp/verify-otp            ║
      // ║  • CRUD /api/{collections}             ║
      // ║                                        ║
      // ╚════════════════════════════════════════╝
      //       `);
      console.log(`Listening... at port : ${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n📴 Shutting down server gracefully...");
  await database.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n📴 Shutting down server gracefully...");
  await database.close();
  process.exit(0);
});

// Start the server
startServer();
