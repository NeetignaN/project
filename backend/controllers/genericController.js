import BaseModel from "../models/BaseModel.js";

class GenericController {
  constructor(modelName) {
    this.model = new BaseModel(modelName);
    this.modelName = modelName;
  }

  async getAll(req, res) {
    try {
      const data = await this.model.findAll();
      res.json(data);
    } catch (error) {
      console.error(`Error fetching ${this.modelName}:`, error);
      res.status(500).json({
        error: `Error fetching ${this.modelName}`,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await this.model.findById(id);

      if (!data) {
        return res.status(404).json({
          error: `${this.modelName} not found`,
        });
      }

      res.json(data);
    } catch (error) {
      console.error(`Error fetching ${this.modelName} by ID:`, error);
      res.status(500).json({
        error: `Error fetching ${this.modelName}`,
      });
    }
  }

  async create(req, res) {
    try {
      const data = await this.model.create(req.body);
      res.status(201).json({
        success: true,
        message: `${this.modelName} created successfully`,
        data,
      });
    } catch (error) {
      console.error(`Error creating ${this.modelName}:`, error);
      res.status(500).json({
        error: `Error creating ${this.modelName}`,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await this.model.updateById(id, req.body);

      if (result.matchedCount === 0) {
        return res.status(404).json({
          error: `${this.modelName} not found`,
        });
      }

      res.json({
        success: true,
        message: `${this.modelName} updated successfully`,
      });
    } catch (error) {
      console.error(`Error updating ${this.modelName}:`, error);
      res.status(500).json({
        error: `Error updating ${this.modelName}`,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await this.model.deleteById(id);

      if (result.deletedCount === 0) {
        return res.status(404).json({
          error: `${this.modelName} not found`,
        });
      }

      res.json({
        success: true,
        message: `${this.modelName} deleted successfully`,
      });
    } catch (error) {
      console.error(`Error deleting ${this.modelName}:`, error);
      res.status(500).json({
        error: `Error deleting ${this.modelName}`,
      });
    }
  }
}

export default GenericController;
