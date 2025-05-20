import { MongoClient } from 'mongodb';

// Log MongoDB connection status
console.log('MongoDB connection configuration:');
console.log('- MONGODB_URI set:', !!process.env.MONGODB_URI);
console.log('- NODE_ENV:', process.env.NODE_ENV);

// Development fallback for MongoDB URI
const FALLBACK_URI = 'mongodb://localhost:27017/DelbiResturant';
const DATABASE_NAME = 'DelbiResturant';

// Check for MongoDB URI and use fallback in development
if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI environment variable is not defined!');
  console.warn('Using fallback connection string for local development');
  
  if (process.env.NODE_ENV === 'development') {
    process.env.MONGODB_URI = FALLBACK_URI;
  } else {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }
}

// Validate and clean MongoDB URI format
let uri = process.env.MONGODB_URI;

// Ensure database name is properly included in the URI
if (uri.includes('mongodb+srv://')) {
  // Extract the base URI without query parameters
  const baseUri = uri.split('?')[0];
  const queryParams = uri.includes('?') ? uri.split('?')[1] : '';
  
  // Check if database name is missing
  if (!baseUri.endsWith('/' + DATABASE_NAME)) {
    // Insert database name before query parameters
    uri = baseUri.endsWith('/') 
      ? `${baseUri}${DATABASE_NAME}${queryParams ? '?' + queryParams : ''}`
      : `${baseUri}/${DATABASE_NAME}${queryParams ? '?' + queryParams : ''}`;
      
    console.log('Updated URI to include database name');
  }
}

// Log sanitized connection info (hide password)
const sanitizedUri = uri.replace(/:([^:@]+)@/, ':***@');
console.log(`Connecting to: ${sanitizedUri}`);

// Enhanced options for better reliability
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 20000,
  dbName: DATABASE_NAME,
  retryWrites: true,
  retryReads: true,
  w: 'majority'
};

console.log(`Connecting to MongoDB database: ${options.dbName}`);

let clientPromise;

// Function to create MongoDB client with error handling
const createMongoClient = async () => {
  let connectionAttempts = 0;
  const maxAttempts = 3;
  
  while (connectionAttempts < maxAttempts) {
    try {
      const newClient = new MongoClient(uri, options);
      console.log(`Connection attempt ${connectionAttempts + 1}/${maxAttempts}...`);
      await newClient.connect();
      console.log('Successfully connected to MongoDB');
      
      // Test connection with a simple operation
      const db = newClient.db(options.dbName);
      const collections = await db.listCollections().toArray();
      console.log(`Found ${collections.length} collections in database`);
      
      // Create required collections if they don't exist
      const requiredCollections = ['Reservation', 'Menu', 'Users'];
      for (const collName of requiredCollections) {
        if (!collections.some(c => c.name === collName)) {
          console.log(`Creating missing collection: ${collName}`);
          await db.createCollection(collName);
        }
      }
      
      return newClient;
    } catch (error) {
      connectionAttempts++;
      console.error(`MongoDB connection error (attempt ${connectionAttempts}/${maxAttempts}):`, {
        name: error.name,
        message: error.message, 
        code: error.code,
        codeName: error.codeName
      });
      
      // Detailed error messages for common connection issues
      if (error.name === 'MongoServerSelectionError') {
        console.error('Could not connect to MongoDB server. This may be due to:');
        console.error('- Network connectivity issues');
        console.error('- MongoDB server is not running');
        console.error('- Authentication failed (check username/password)');
        console.error('- IP address not whitelisted in MongoDB Atlas');
      } else if (error.name === 'MongoParseError') {
        console.error('Invalid MongoDB connection string format');
        // Stop retrying on parse errors as they won't resolve by retrying
        break;
      } else if (error.code === 8000 && error.codeName === 'AtlasError') {
        console.error('Authentication failed - Invalid username or password in connection string');
        // Stop retrying on auth errors as they won't resolve by retrying
        break;
      }
      
      if (connectionAttempts < maxAttempts) {
        const delay = 1000 * connectionAttempts; // Increase delay with each attempt
        console.log(`Retrying connection in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('Maximum connection attempts reached. Could not connect to MongoDB.');
        
        // If in development mode and using Atlas, attempt to connect to localhost
        if (process.env.NODE_ENV === 'development' && uri !== FALLBACK_URI && uri.includes('mongodb+srv')) {
          console.warn('Attempting to connect to local MongoDB instance instead...');
          try {
            const localClient = new MongoClient(FALLBACK_URI, options);
            await localClient.connect();
            console.log('Successfully connected to local MongoDB');
            return localClient;
          } catch (localError) {
            console.error('Failed to connect to local MongoDB:', localError.message);
          }
        }
        
        throw error;
      }
    }
  }
};

// Connection caching for development
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    console.log('Creating new MongoDB connection for development');
    global._mongoClientPromise = createMongoClient()
      .catch(err => {
        console.error("Failed to connect to MongoDB:", err.message);
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using mock database for development due to connection failure');
          // Return null to indicate mock mode should be used
          return null;
        }
        throw err;
      });
  } else {
    console.log('Reusing existing MongoDB connection from cache');
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Production: create new connection for each instance
  console.log('Creating new MongoDB connection for production');
  clientPromise = createMongoClient();
}

export default clientPromise;

// Helper to check if we need to use mock data
export async function shouldUseMockData() {
  try {
    const client = await clientPromise;
    return client === null;
  } catch (error) {
    return true;
  }
} 