import { find, insertOne, updateOne, deleteOne, findOne } from '../../../lib/db';
import { verifyAdminToken } from '../../../utils/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Check admin authentication
  const authResult = verifyAdminToken(req);
  if (!authResult.authenticated) {
    return res.status(401).json({ error: 'Unauthorized', details: authResult.error });
  }

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // Get a specific menu item if ID provided
        if (req.query.id) {
          // Convert string ID to ObjectId
          let objectId;
          try {
            objectId = new ObjectId(req.query.id);
          } catch (err) {
            return res.status(400).json({ error: 'Invalid ID format' });
          }
          
          const menuItem = await findOne('Menu', { _id: objectId });
          if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found' });
          }
          return res.status(200).json(menuItem);
        }
        
        // Get all menu items with optional filters
        const query = {};
        
        // Filter by category
        if (req.query.category) {
          query.category = req.query.category;
        }
        
        // Filter by availability
        if (req.query.available === 'true') {
          query.available = true;
        } else if (req.query.available === 'false') {
          query.available = false;
        }
        
        const menuItems = await find('Menu', query);
        
        // Organize by category for admin display
        if (req.query.organizeByCategory === 'true') {
          const categorized = {};
          menuItems.forEach(item => {
            if (!categorized[item.category]) {
              categorized[item.category] = [];
            }
            categorized[item.category].push(item);
          });
          return res.status(200).json(categorized);
        }
        
        return res.status(200).json(menuItems);

      case 'POST':
        // Validate required fields
        const { name, price, description, category } = req.body;
        if (!name || !price || !category) {
          return res.status(400).json({ error: 'Name, price, and category are required fields' });
        }
        
        // Create new menu item
        const newItem = await insertOne('Menu', {
          name,
          price: parseFloat(price),
          description: description || '',
          category,
          image: req.body.image || null,
          available: req.body.available !== false,
          createdAt: new Date(),
          createdBy: authResult.user.username
        });
        
        return res.status(201).json(newItem);

      case 'PUT':
        // Update menu item
        const { id, ...updateData } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Menu item ID is required' });
        }
        
        // Convert string ID to ObjectId
        let objectId;
        try {
          objectId = new ObjectId(id);
        } catch (err) {
          return res.status(400).json({ error: 'Invalid ID format' });
        }
        
        // Convert price to float if provided
        if (updateData.price) {
          updateData.price = parseFloat(updateData.price);
        }
        
        // Add audit information
        updateData.updatedAt = new Date();
        updateData.updatedBy = authResult.user.username;
        
        const updatedItem = await updateOne('Menu', { _id: objectId }, updateData);
        if (updatedItem.matchedCount === 0) {
          return res.status(404).json({ error: 'Menu item not found' });
        }
        
        return res.status(200).json({ message: 'Menu item updated successfully' });

      case 'DELETE':
        // Delete menu item
        const { id: deleteId } = req.body;
        if (!deleteId) {
          return res.status(400).json({ error: 'Menu item ID is required' });
        }
        
        // Convert string ID to ObjectId
        let deleteObjectId;
        try {
          deleteObjectId = new ObjectId(deleteId);
        } catch (err) {
          return res.status(400).json({ error: 'Invalid ID format' });
        }
        
        const deletedItem = await deleteOne('Menu', { _id: deleteObjectId });
        if (deletedItem.deletedCount === 0) {
          return res.status(404).json({ error: 'Menu item not found' });
        }
        
        return res.status(200).json({ message: 'Menu item deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Admin Menu API error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request', details: error.message });
  }
} 