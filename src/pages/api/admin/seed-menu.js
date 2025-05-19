import { getCollection } from '../../../lib/db';
import { ObjectId } from 'mongodb';
import { verifyAdminToken } from '../../../utils/auth';

// Sample menu items data
const sampleMenuItems = [
  {
    _id: new ObjectId(),
    name: "Classic Arabic Hummus",
    price: 7.50,
    description: "Creamy chickpea spread with tahini, lemon juice, and olive oil, served with fresh pita bread",
    category: "Starters",
    image: "/images/menu/hummus.jpg",
    available: true,
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Tabbouleh",
    price: 6.90,
    description: "Fresh parsley, tomatoes, mint, onion, and bulgur salad with lemon dressing",
    category: "Starters",
    image: "/images/menu/tabbouleh.jpg",
    available: true,
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Falafel Plate",
    price: 8.50,
    description: "Crispy chickpea fritters served with tahini sauce and pickled vegetables",
    category: "Starters",
    image: "/images/menu/falafel.jpg",
    available: true,
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Lamb Kofta",
    price: 15.90,
    description: "Seasoned ground lamb skewers grilled to perfection, served with saffron rice and grilled vegetables",
    category: "Main Courses",
    image: "/images/menu/lamb-kofta.jpg",
    available: true,
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Chicken Shawarma Platter",
    price: 14.50,
    description: "Marinated chicken slices with Middle Eastern spices, served with rice, salad, and garlic sauce",
    category: "Main Courses",
    image: "/images/menu/shawarma.jpg",
    available: true,
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Vegetable Couscous",
    price: 12.90,
    description: "Fluffy couscous topped with seasonal vegetables and aromatic broth",
    category: "Main Courses",
    image: "/images/menu/couscous.jpg",
    available: true,
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Baklava",
    price: 5.50,
    description: "Layers of phyllo pastry filled with chopped nuts and sweetened with honey syrup",
    category: "Desserts",
    image: "/images/menu/baklava.jpg",
    available: true,
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Kunafa",
    price: 6.90,
    description: "Sweet cheese pastry soaked in sugar syrup, topped with crushed pistachios",
    category: "Desserts",
    image: "/images/menu/kunafa.jpg",
    available: true,
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Arabic Coffee",
    price: 3.50,
    description: "Traditional Arabic coffee with cardamom, served with dates",
    category: "Drinks",
    image: "/images/menu/arabic-coffee.jpg",
    available: true,
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Fresh Mint Tea",
    price: 3.90,
    description: "Aromatic tea with fresh mint leaves and honey",
    category: "Drinks",
    image: "/images/menu/mint-tea.jpg",
    available: true,
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Seasonal Fruit Juice",
    price: 4.50,
    description: "Freshly squeezed seasonal fruits",
    category: "Drinks",
    image: "/images/menu/fruit-juice.jpg",
    available: true,
    createdAt: new Date()
  }
];

export default async function handler(req, res) {
  // Verify admin authentication
  const authResult = verifyAdminToken(req);
  if (!authResult.authenticated) {
    return res.status(401).json({ error: 'Unauthorized', details: authResult.error });
  }

  // Restrict to POST method for security
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const collection = await getCollection('Menu');
    
    // Drop existing collection to start fresh
    await collection.deleteMany({});
    
    // Add creator information to each item
    const itemsWithCreator = sampleMenuItems.map(item => ({
      ...item,
      createdBy: authResult.user.username
    }));
    
    // Insert sample data
    await collection.insertMany(itemsWithCreator);
    
    res.status(200).json({ 
      success: true, 
      message: 'Menu seeded successfully',
      count: itemsWithCreator.length
    });
  } catch (error) {
    console.error('Error seeding menu data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to seed menu data',
      details: error.message 
    });
  }
} 