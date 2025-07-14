import BaseModel from "./BaseModel.js";

class Client extends BaseModel {
  constructor() {
    super("clients");
  }

  async findByDesignerId(designerId) {
    try {
      return await this.findAll({ designerId });
    } catch (error) {
      console.error("Error finding clients by designer ID:", error);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      return await this.findOne({ email });
    } catch (error) {
      console.error("Error finding client by email:", error);
      throw error;
    }
  }
}

export default Client;
