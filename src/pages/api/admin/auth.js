import jwt from 'jsonwebtoken';
import { findOne } from '../../../lib/db';

// This would be stored more securely in a real application
const JWT_SECRET = process.env.JWT_SECRET || 'delbi-restaurant-secret-key';

export default async function handler(req, res) {
  // Only allow POST for login
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // In a production app, first try to find the admin user in the database
    let adminUser = null;
    
    try {
      adminUser = await findOne('AdminUsers', { username });
    } catch (dbError) {
      console.error('Error accessing admin users collection:', dbError);
      // Continue with fallback for demo
    }

    // If admin user exists in DB, verify credentials
    if (adminUser) {
      // In a real app, you would use bcrypt.compare to check hashed passwords
      // For this demo, we'll assume plaintext comparison (not for production!)
      if (adminUser.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } 
    // Fallback for demo purposes if no users in database
    else if (username === 'admin' && password === 'admin123') {
      // This is a fallback for demo - create an admin user
      adminUser = {
        username: 'admin',
        name: 'Administrator',
        role: 'admin'
      };
    } else {
      // No user found and fallback credentials are incorrect
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create and sign the JWT token
    const token = jwt.sign(
      {
        username: adminUser.username,
        name: adminUser.name || 'Administrator',
        role: adminUser.role || 'admin',
      },
      JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    // Return the token
    return res.status(200).json({
      message: 'Authentication successful',
      token,
      user: {
        username: adminUser.username,
        name: adminUser.name || 'Administrator',
        role: adminUser.role || 'admin',
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed', details: error.message });
  }
} 