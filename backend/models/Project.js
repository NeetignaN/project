import BaseModel from "./BaseModel.js";

class Project extends BaseModel {
  constructor() {
    super("projects");
  }

  async findByDesignerId(designerId) {
    try {
      return await this.findAll({ designerId });
    } catch (error) {
      console.error("Error finding projects by designer ID:", error);
      throw error;
    }
  }

  async findByClientId(clientId) {
    try {
      return await this.findAll({ clientId });
    } catch (error) {
      console.error("Error finding projects by client ID:", error);
      throw error;
    }
  }

  async findByStatus(status) {
    try {
      return await this.findAll({ status });
    } catch (error) {
      console.error("Error finding projects by status:", error);
      throw error;
    }
  }
}

export default Project;
