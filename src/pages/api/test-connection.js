import clientPromise from '../../lib/mongodb';
import { getDb, getCollection } from '../../lib/db';

export default async function handler(req, res) {
  // Collect diagnostic information
  const diagnostics = {
    environment: {
      node_env: process.env.NODE_ENV,
      mongodb_uri_set: !!process.env.MONGODB_URI,
      mongodb_uri_provider: process.env.MONGODB_URI ? process.env.MONGODB_URI.split('@')[1]?.split('/')[0] : null,
      test_mode: process.env.TEST_MODE === 'true',
      platform: process.platform,
      node_version: process.version
    },
    connection_attempts: []
  };

  try {
    // Step 1: Create MongoDB client
    diagnostics.connection_attempts.push({
      step: "Creating client",
      status: "pending"
    });
    
    const client = await clientPromise;
    
    diagnostics.connection_attempts[0].status = "success";
    
    // Step 2: Connect to MongoDB
    diagnostics.connection_attempts.push({
      step: "Connecting to MongoDB",
      status: "pending"
    });
    
    // The client is already connected at this point if clientPromise resolved
    diagnostics.connection_attempts[1].status = "success";
    
    // Step 3: Access database
    diagnostics.connection_attempts.push({
      step: "Accessing database",
      status: "pending"
    });
    
    const db = await getDb();
    
    // Get collections
    const collections = await db.listCollections().toArray();
    diagnostics.connection_attempts[2].status = "success";
    diagnostics.connection_attempts[2].collections = collections.map(c => c.name);
    
    // Check for required collections
    const requiredCollections = ["Reservation", "VerificationCodes"];
    const missingCollections = requiredCollections.filter(
      name => !collections.some(c => c.name === name)
    );
    
    if (missingCollections.length > 0) {
      diagnostics.connection_attempts[2].warning = "Missing required collections: " + missingCollections.join(", ");
      diagnostics.connection_attempts[2].solution = "Collections will be created automatically when you first write to them";
    }
    
    return res.status(200).json({
      status: "success",
      message: "MongoDB connection successful",
      diagnostics
    });
  } catch (error) {
    console.error("Test connection error:", error);
    
    // Update the last attempt with error info
    if (diagnostics.connection_attempts.length > 0) {
      const lastAttempt = diagnostics.connection_attempts[diagnostics.connection_attempts.length - 1];
      lastAttempt.status = "error";
      lastAttempt.error = {
        name: error.name,
        message: error.message,
        code: error.code
      };
    }
    
    // Add troubleshooting information
    let troubleshooting = [];
    
    if (error.name === 'MongoServerSelectionError') {
      troubleshooting = [
        "Check if your MongoDB Atlas cluster is running",
        "Verify that your IP address is whitelisted in MongoDB Atlas",
        "Confirm your connection string is correct in .env.local",
        "Ensure your network allows connections to MongoDB Atlas"
      ];
    } else if (error.name === 'MongoParseError') {
      troubleshooting = [
        "Your MongoDB connection string is invalid",
        "Check the format of MONGODB_URI in .env.local"
      ];
    } else if (error.name === 'MongoNetworkError') {
      troubleshooting = [
        "Network connectivity issue detected",
        "Check your internet connection",
        "Verify firewall settings are not blocking MongoDB connections"
      ];
    }
    
    return res.status(500).json({
      status: "error",
      message: "MongoDB connection failed",
      error: {
        name: error.name,
        message: error.message,
        code: error.code
      },
      troubleshooting,
      diagnostics
    });
  }
} 