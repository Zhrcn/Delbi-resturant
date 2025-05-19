import { find, insertOne, updateOne, deleteOne, findOne } from '../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // Get a specific menu item if ID is provided
        if (req.query.id) {
          const menuItem = await findOne('Menu', { _id: req.query.id });
          if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
          }
          return res.status(200).json(menuItem);
        }
        
        // Get menu items with optional category filter
        const query = {};
        if (req.query.category) {
          query.category = req.query.category;
        }
        
        const menuItems = await find('Menu', query);
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
          createdAt: new Date()
        });
        
        return res.status(201).json(newItem);

      case 'PUT':
        // Update menu item
        const { id, ...updateData } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Menu item ID is required' });
        }
        
        // Convert price to float if provided
        if (updateData.price) {
          updateData.price = parseFloat(updateData.price);
        }
        
        const updatedItem = await updateOne('Menu', { _id: id }, updateData);
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
        
        const deletedItem = await deleteOne('Menu', { _id: deleteId });
        if (deletedItem.deletedCount === 0) {
          return res.status(404).json({ error: 'Menu item not found' });
        }
        
        return res.status(200).json({ message: 'Menu item deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Menu API error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request', details: error.message });
  }
} 