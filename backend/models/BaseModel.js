import { ObjectId } from "mongodb";
import database from "../config/database.js";

class BaseModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.collection = null;
  }

  getCollection() {
    if (!this.collection) {
      const db = database.getDb();
      this.collection = db.collection(this.collectionName);
    }
    return this.collection;
  }

  async findAll(filter = {}) {
    try {
      const collection = this.getCollection();
      return await collection.find(filter).toArray();
    } catch (error) {
      console.error(`Error finding all ${this.collectionName}:`, error);
      throw error;
    }
  }
  async findById(id) {
    try {
      const collection = this.getCollection();

      // Try to find by custom 'id' field first, then by MongoDB '_id'
      let document = await collection.findOne({ id: id });

      // If no document found and the id looks like a MongoDB ObjectId, try _id
      if (!document && ObjectId.isValid(id)) {
        const objectId = new ObjectId(id);
        document = await collection.findOne({ _id: objectId });
      }

      return document;
    } catch (error) {
      console.error(`Error finding ${this.collectionName} by ID:`, error);
      throw error;
    }
  }

  async findOne(filter) {
    try {
      const collection = this.getCollection();
      return await collection.findOne(filter);
    } catch (error) {
      console.error(`Error finding one ${this.collectionName}:`, error);
      throw error;
    }
  }

  async create(data) {
    try {
      const collection = this.getCollection();
      const result = await collection.insertOne({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { ...data, _id: result.insertedId };
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      throw error;
    }
  }  async updateById(id, data) {
    try {
      const collection = this.getCollection();
      
      console.log(`🔧 BaseModel updateById: Attempting to update ${this.collectionName} with id:`, id);
      console.log(`📊 Update data:`, data);

      // Remove _id from update data since it's immutable in MongoDB
      const { _id, ...updateData } = data;
      
      console.log(`🧹 Cleaned update data (removed _id):`, updateData);

      // Try to update by custom 'id' field first, then by MongoDB '_id'
      let result = await collection.updateOne(
        { id: id },
        {
          $set: {
            ...updateData,
            updatedAt: new Date(),
          },
        }
      );
      
      console.log(`📋 Update result (by id field):`, result);

      // If no document was updated and the id looks like a MongoDB ObjectId, try _id
      if (result.matchedCount === 0 && ObjectId.isValid(id)) {
        console.log(`🔄 No match by 'id' field, trying MongoDB '_id' field...`);
        const objectId = new ObjectId(id);
        result = await collection.updateOne(
          { _id: objectId },
          {
            $set: {
              ...updateData,
              updatedAt: new Date(),
            },
          }
        );
        console.log(`📋 Update result (by _id field):`, result);
      }

      console.log(`✅ Final update result for ${this.collectionName}:`, result);
      return result;
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      throw error;
    }
  }
  async deleteById(id) {
    try {
      const collection = this.getCollection();

      // Try to delete by custom 'id' field first, then by MongoDB '_id'
      let result = await collection.deleteOne({ id: id });

      // If no document was deleted and the id looks like a MongoDB ObjectId, try _id
      if (result.deletedCount === 0 && ObjectId.isValid(id)) {
        const objectId = new ObjectId(id);
        result = await collection.deleteOne({ _id: objectId });
      }

      return result;
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      throw error;
    }
  }

  async count(filter = {}) {
    try {
      const collection = this.getCollection();
      return await collection.countDocuments(filter);
    } catch (error) {
      console.error(`Error counting ${this.collectionName}:`, error);
      throw error;
    }
  }
}

export default BaseModel;
