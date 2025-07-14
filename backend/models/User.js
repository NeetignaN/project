import BaseModel from "./BaseModel.js";

class User extends BaseModel {
  constructor() {
    super("credentials");
  }

  async findByEmailAndRole(email, role) {
    try {
      return await this.findOne({ email, role });
    } catch (error) {
      console.error("Error finding user by email and role:", error);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      return await this.findOne({ email });
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  }

  async authenticate(email, password, role) {
    try {
      const user = await this.findOne({
        email,
        password,
        role,
      });
      return user;
    } catch (error) {
      console.error("Error authenticating user:", error);
      throw error;
    }
  }

  async getUserDetailsByRole(role, userId) {
    try {
      const roleCollections = {
        designer: "designers",
        client: "clients",
        admin: "admins",
        vendor: "vendors",
      };

      const collectionName = roleCollections[role];
      if (!collectionName) {
        throw new Error(`Invalid role: ${role}`);
      }

      const roleModel = new BaseModel(collectionName);
      return await roleModel.findOne({ id: userId });
    } catch (error) {
      console.error("Error getting user details by role:", error);
      throw error;
    }
  }
}

export default User;
