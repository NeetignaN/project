import { Router } from "express";
import GenericController from "../controllers/genericController.js";

const router = Router();

// Collections that need CRUD operations
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

// Auto-generate routes for each collection
collections.forEach((collectionName) => {
  const controller = new GenericController(collectionName);

  // GET all items
  router.get(`/${collectionName}`, controller.getAll.bind(controller));

  // GET item by ID
  router.get(`/${collectionName}/:id`, controller.getById.bind(controller));

  // POST create new item
  router.post(`/${collectionName}`, controller.create.bind(controller));
  // PUT update item by ID
  router.put(`/${collectionName}/:id`, controller.update.bind(controller));

  // PATCH update item by ID (partial update)
  router.patch(`/${collectionName}/:id`, controller.update.bind(controller));

  // DELETE item by ID
  router.delete(`/${collectionName}/:id`, controller.delete.bind(controller));
});

// Custom route for updating designer vendor connections
router.patch('/designers/:id/vendor-connections', async (req, res) => {
  try {
    const { id: designerId } = req.params;
    const { vendorId } = req.body;
    
    console.log(`🔗 Adding vendor connection: Designer ${designerId} -> Vendor ${vendorId}`);
    
    const designerController = new GenericController('designers');
    
    // Get current designer
    const designer = await designerController.model.findById(designerId);
    if (!designer) {
      return res.status(404).json({ error: 'Designer not found' });
    }
    
    // Add vendor to vendor_connections array if not already present
    const vendorConnections = designer.vendor_connections || [];
    if (!vendorConnections.includes(vendorId)) {
      vendorConnections.push(vendorId);
    }
    
    // Update designer with new vendor connections
    const result = await designerController.model.updateById(designerId, {
      vendor_connections: vendorConnections
    });
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Designer not found' });
    }
    
    res.json({
      success: true,
      message: 'Vendor connection added successfully',
      vendor_connections: vendorConnections
    });
    
  } catch (error) {
    console.error('Error updating vendor connection:', error);
    res.status(500).json({ error: 'Error updating vendor connection' });  }
});

// Custom route for adding messages to conversations
router.patch('/conversations/:id/messages', async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const messageObj = req.body;
    
    console.log(`💬 Adding message to conversation: ${conversationId}`);
    console.log(`📝 Message data:`, messageObj);
    
    const conversationController = new GenericController('conversations');
    
    // Get current conversation
    const conversation = await conversationController.model.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Add message to messages array
    const messages = conversation.messages || [];
    
    // Add timestamp if not provided
    if (!messageObj.timestamp) {
      messageObj.timestamp = new Date().toISOString();
    }
    
    messages.push(messageObj);
    
    // Update conversation with new message
    const result = await conversationController.model.updateById(conversationId, {
      messages: messages,
      updatedAt: new Date()
    });
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json({
      success: true,
      message: 'Message added successfully',
      messageObj
    });
    
  } catch (error) {
    console.error('Error adding message to conversation:', error);
    res.status(500).json({ error: 'Error adding message to conversation' });
  }
});

export default router;
