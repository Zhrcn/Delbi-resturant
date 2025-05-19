import { MongoClient } from 'mongodb';

// Log MongoDB connection status
console.log('MongoDB connection configuration:');
console.log('- MONGODB_URI set:', !!process.env.MONGODB_URI);
console.log('- NODE_ENV:', process.env.NODE_ENV);

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const uri = process.env.MONGODB_URI;
// Enhanced options for better reliability
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000, // Increased timeout
  socketTimeoutMS: 45000,
  dbName: 'DelbiResturant', // Explicitly set the database name
  retryWrites: true,
  w: 'majority',
};

console.log(`Connecting to MongoDB database: ${options.dbName}`);

let client;
let clientPromise;

// Function to create MongoDB client with connection retries
const createMongoClient = async () => {
  try {
    const newClient = new MongoClient(uri, options);
    console.log('Attempting to connect to MongoDB...');
    await newClient.connect();
    console.log('Successfully connected to MongoDB');
    
    // Test a simple operation to verify the connection
    const db = newClient.db(options.dbName);
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections in database`);
    
    return newClient;
  } catch (error) {
    console.error('MongoDB connection error:', {
      name: error.name,
      message: error.message, 
      code: error.code,
      codeName: error.codeName
    });
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('This may be due to network issues or incorrect credentials');
    }
    
    throw error;
  }
};

// Global cache for development to prevent multiple connections
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    console.log('Creating new MongoDB connection for development');
    global._mongoClientPromise = createMongoClient()
      .catch(err => {
        console.error("Failed to connect to MongoDB:", err);
        throw err;
      });
  } else {
    console.log('Reusing existing MongoDB connection from cache');
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new connection for each instance
  console.log('Creating new MongoDB connection for production');
  clientPromise = createMongoClient()
    .catch(err => {
      console.error("Failed to connect to MongoDB:", err);
      throw err;
    });
}

export default clientPromise; 