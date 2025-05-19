import { verifyAdminToken } from '../../../utils/auth';

export default async function handler(req, res) {
  try {
    // Get the raw Authorization header to debug
    const authHeader = req.headers.authorization || 'No Authorization header';

    // Check authentication
    const authResult = verifyAdminToken(req);
    
    // Return diagnostic information
    return res.status(authResult.authenticated ? 200 : 401).json({
      timestamp: new Date().toISOString(),
      authHeader: authHeader.startsWith('Bearer ') 
        ? `Bearer ${authHeader.split(' ')[1].substring(0, 10)}...` // Only show part of token for security
        : authHeader,
      authenticated: authResult.authenticated,
      error: authResult.error,
      user: authResult.user,
      requestInfo: {
        method: req.method,
        url: req.url,
        headers: {
          // Include only relevant headers for debugging
          'content-type': req.headers['content-type'],
          'user-agent': req.headers['user-agent']
        }
      }
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return res.status(500).json({ 
      error: 'Authentication test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 