import clientPromise from '../../../lib/mongodb';
import { verifyAdminToken } from '../../../utils/auth';

export default async function handler(req, res) {
  // Verify authentication
  const authResult = verifyAdminToken(req);
  
  // If not authenticated and it's not a development environment
  if (!authResult.authenticated && process.env.NODE_ENV !== 'development') {
    return res.status(401).json({
      connected: false,
      error: 'Authentication required',
      message: 'You must be logged in to check the database connection'
    });
  }

  try {
    // Get connection string info for diagnostics (hide password)
    const connectionInfo = process.env.MONGODB_URI ? 
      process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':***@') : 
      'Not configured';

    // Check for potential connection string issues before attempting connection
    let connectionStringIssues = [];
    if (connectionInfo) {
      if (!connectionInfo.includes('mongodb+srv://') && !connectionInfo.includes('mongodb://')) {
        connectionStringIssues.push('Connection string does not start with mongodb:// or mongodb+srv://');
      }
      
      if (connectionInfo.includes('mongodb+srv://') && !connectionInfo.includes('/DelbiResturant')) {
        connectionStringIssues.push('Connection string may be missing database name (/DelbiResturant)');
      }
      
      if (connectionInfo.includes('?') && !connectionInfo.includes('retryWrites=true')) {
        connectionStringIssues.push('Connection string should include retryWrites=true for reliability');
      }
    }

    // Create MongoDB client
    const client = await clientPromise;
    
    // The client is already connected if clientPromise resolved
    const db = client.db("DelbiResturant");
    
    // Make a simple query to verify the connection
    const collections = await db.listCollections().toArray();
    
    // Check for required collections
    const requiredCollections = ["Reservation", "Menu", "Users"];
    const missingCollections = requiredCollections.filter(
      name => !collections.some(c => c.name === name)
    );

    // Create collections if they don't exist
    if (missingCollections.length > 0) {
      for (const collName of missingCollections) {
        await db.createCollection(collName);
        console.log(`Created missing collection: ${collName}`);
      }
    }
    
    // Run a ping test for latency
    const startTime = Date.now();
    await db.command({ ping: 1 });
    const pingTime = Date.now() - startTime;
    
    // Return success with diagnostic info
    return res.status(200).json({
      connected: true,
      collections: collections.map(c => c.name),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      connection: {
        uri: connectionInfo,
        database: "DelbiResturant",
        pingLatency: `${pingTime}ms`
      },
      warnings: connectionStringIssues.length > 0 ? connectionStringIssues : undefined
    });
  } catch (error) {
    console.error("MongoDB connection test error:", error);
    
    // Provide helpful troubleshooting information
    let troubleshooting = [];
    let errorDetails = {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName
    };
    
    // Authentication error
    if (error.code === 8000 && error.codeName === 'AtlasError') {
      troubleshooting = [
        "Your MongoDB username or password is incorrect",
        "Update your .env.local file with the correct credentials",
        "Make sure the database user exists in MongoDB Atlas"
      ];
    } 
    // Server selection error
    else if (error.name === 'MongoServerSelectionError') {
      troubleshooting = [
        "Check if your MongoDB Atlas cluster is running",
        "Verify that your IP address is whitelisted in MongoDB Atlas",
        "Confirm your connection string includes the database name (/DelbiResturant)",
        "Ensure your network allows connections to MongoDB Atlas"
      ];
    } 
    // Parse error
    else if (error.name === 'MongoParseError') {
      troubleshooting = [
        "Your MongoDB connection string is invalid",
        "Make sure the format is: mongodb+srv://username:password@cluster.domain.mongodb.net/DelbiResturant?options"
      ];
    } 
    // Network error
    else if (error.name === 'MongoNetworkError') {
      troubleshooting = [
        "Network connectivity issue detected",
        "Check your internet connection",
        "Verify firewall settings are not blocking MongoDB connections"
      ];
    }
    
    // Check connection string format
    let connectionStringDiagnostics = null;
    
    if (process.env.MONGODB_URI) {
      const sanitizedUri = process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':***@');
      connectionStringDiagnostics = {
        provided: sanitizedUri,
        hasCorrectProtocol: sanitizedUri.startsWith('mongodb://') || sanitizedUri.startsWith('mongodb+srv://'),
        includesDatabase: sanitizedUri.includes('/DelbiResturant'),
        hasQueryParameters: sanitizedUri.includes('?'),
      };
      
      // Create correct format example
      let baseUrl = '';
      if (sanitizedUri.includes('@')) {
        baseUrl = sanitizedUri.split('@')[1].split('?')[0].split('/')[0];
      }
      
      if (baseUrl) {
        const correctFormat = `mongodb+srv://username:password@${baseUrl}/DelbiResturant?retryWrites=true&w=majority`;
        connectionStringDiagnostics.correctFormatExample = correctFormat;
      }
    }
    
    return res.status(500).json({
      connected: false,
      error: errorDetails,
      troubleshooting,
      connectionStringDiagnostics,
      timestamp: new Date().toISOString()
    });
  }
} 