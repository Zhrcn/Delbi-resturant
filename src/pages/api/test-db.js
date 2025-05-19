import clientPromise from '../../lib/mongodb';
import { getDb } from '../../lib/db';

export default async function handler(req, res) {
  try {
    // Test direct client connection
    const client = await clientPromise;
    const isConnected = client.topology.isConnected();
    
    // Get database information
    const db = await getDb();
    const dbName = db.databaseName;
    
    // List collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    // Check env variables
    const envCheck = {
      MONGODB_URI: process.env.MONGODB_URI ? "✓ Set" : "✗ Missing",
      EMAIL_USER: process.env.EMAIL_USER ? "✓ Set" : "✗ Missing",
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "✓ Set" : "✗ Missing"
    };
    
    // Return success and connection details
    return res.status(200).json({
      status: 'success',
      connection: {
        isConnected,
        dbName,
        collections: collectionNames
      },
      environment: envCheck
    });
  } catch (error) {
    console.error('Database connection test error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to connect to database',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 