import { getDb } from '../../lib/db';

const sampleMenuItems = [
  {
    name: 'Classic Burger',
    price: 12.99,
    description: 'Juicy beef patty with lettuce, tomato, and special sauce',
    category: 'Main',
    image: '/images/menu/burger.jpg',
    available: true
  },
  {
    name: 'Margherita Pizza',
    price: 14.99,
    description: 'Fresh mozzarella, tomatoes, and basil',
    category: 'Main',
    image: '/images/menu/pizza.jpg',
    available: true
  },
  {
    name: 'Caesar Salad',
    price: 8.99,
    description: 'Crisp romaine lettuce with Caesar dressing, croutons, and parmesan',
    category: 'Starter',
    image: '/images/menu/salad.jpg',
    available: true
  },
  {
    name: 'Chocolate Cake',
    price: 6.99,
    description: 'Rich chocolate cake with a scoop of vanilla ice cream',
    category: 'Dessert',
    image: '/images/menu/cake.jpg',
    available: true
  }
];

const sampleReservations = [
  {
    name: 'John Doe',
    phone: '+1234567890',
    date: '2023-10-15',
    time: '19:00',
    guests: 2,
    status: 'confirmed',
    createdAt: new Date()
  },
  {
    name: 'Jane Smith',
    phone: '+9876543210',
    date: '2023-10-16',
    time: '20:30',
    guests: 4,
    status: 'confirmed',
    createdAt: new Date()
  }
];

export default async function handler(req, res) {
  // Only allow POST method for security
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const db = await getDb();
    const results = { menu: {}, reservations: {} };

    // Seed menu items
    try {
      await db.collection('menu_items').deleteMany({});
      const menuResult = await db.collection('menu_items').insertMany(sampleMenuItems);
      results.menu = {
        success: true,
        count: menuResult.insertedCount,
        ids: menuResult.insertedIds
      };
    } catch (error) {
      results.menu = {
        success: false,
        error: error.message
      };
    }

    // Seed reservations
    try {
      await db.collection('reservations').deleteMany({});
      const reservationsResult = await db.collection('reservations').insertMany(sampleReservations);
      results.reservations = {
        success: true,
        count: reservationsResult.insertedCount,
        ids: reservationsResult.insertedIds
      };
    } catch (error) {
      results.reservations = {
        success: false,
        error: error.message
      };
    }

    // Return results
    return res.status(200).json({
      message: 'Database seeded successfully',
      results
    });
  } catch (error) {
    console.error('Seed error:', error);
    return res.status(500).json({
      message: 'Failed to seed database',
      error: error.message
    });
  }
} 