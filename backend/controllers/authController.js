import User from "../models/User.js";

class AuthController {
  constructor() {
    this.userModel = new User();
  }

  async login(req, res) {
    try {
      const { email, password, role } = req.body;

      if (!email || !password || !role) {
        return res.status(400).json({
          error: "Email, password, and role are required",
        });
      }

      // Authenticate user
      const user = await this.userModel.authenticate(email, password, role);

      if (!user) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      // Get user details from role-specific collection
      const userDetails = await this.userModel.getUserDetailsByRole(
        role,
        user.id
      );

      if (!userDetails) {
        return res.status(404).json({
          error: "User details not found",
        });
      }

      res.json({
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          ...userDetails,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        error: "Internal server error during login",
      });
    }
  }

  async register(req, res) {
    try {
      const { email, password, role, ...userData } = req.body;

      if (!email || !password || !role) {
        return res.status(400).json({
          error: "Email, password, and role are required",
        });
      }

      // Check if user already exists
      const existingUser = await this.userModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: "User with this email already exists",
        });
      }

      // Create user credentials
      const newUser = await this.userModel.create({
        email,
        password,
        role,
        id: userData.id || Date.now().toString(),
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        error: "Internal server error during registration",
      });
    }
  }
}

export default new AuthController();
