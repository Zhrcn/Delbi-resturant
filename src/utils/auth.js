import jwt from 'jsonwebtoken';

// This secret should be stored in environment variables in a real application
const JWT_SECRET = process.env.JWT_SECRET || 'delbi-restaurant-secret-key';

/**
 * Verify JWT token from request headers
 * @param {Object} req - Next.js request object
 * @returns {Object} Authentication result with user data if authenticated
 */
export function verifyAdminToken(req) {
  try {
    // Handle case where request is undefined or null
    if (!req || !req.headers) {
      console.error('Invalid request object provided to verifyAdminToken');
      return { 
        authenticated: false, 
        error: 'Invalid request format' 
      };
    }
    
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { 
        authenticated: false, 
        error: 'Missing or invalid authentication token' 
      };
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return { 
        authenticated: false, 
        error: 'Missing authentication token' 
      };
    }
    
    // For demo purposes, provide a default admin user if using the demo token
    if (token === 'demo-token') {
      return {
        authenticated: true,
        user: {
          username: 'admin',
          name: 'Administrator',
          role: 'admin'
        }
      };
    }
    
    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      return { 
        authenticated: false, 
        error: jwtError.message 
      };
    }
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return { 
        authenticated: false, 
        error: 'Token expired' 
      };
    }
    
    // Check if user has admin role
    if (decoded.role !== 'admin') {
      return { 
        authenticated: false, 
        error: 'Insufficient permissions' 
      };
    }
    
    // Authentication successful
    return {
      authenticated: true,
      user: {
        username: decoded.username,
        name: decoded.name,
        role: decoded.role
      }
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    
    return {
      authenticated: false,
      error: error.message || 'Authentication failed'
    };
  }
}

/**
 * Generate JWT token for authenticated admin user
 * @param {Object} user - User object with username, name, and role
 * @returns {string} JWT token
 */
export function generateAdminToken(user) {
  return jwt.sign(
    {
      username: user.username,
      name: user.name || user.username,
      role: user.role || 'admin',
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Check if client-side token exists and is valid
 * @returns {boolean} True if token exists and is not expired
 */
export function isAuthenticated() {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    return false;
  }
  
  try {
    // Decode the token without verification
    // Just to check if it's expired
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Token parsing error:', error);
    return false;
  }
}

/**
 * Get user data from token
 * @returns {Object|null} User data or null if not authenticated
 */
export function getUserFromToken() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    return null;
  }
  
  try {
    // Decode the token without verification
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return {
      username: decoded.username,
      name: decoded.name,
      role: decoded.role
    };
  } catch (error) {
    console.error('Token parsing error:', error);
    return null;
  }
} 