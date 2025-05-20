import clientPromise, { shouldUseMockData } from './mongodb';
import { ObjectId } from 'mongodb';

// Maximum number of retry attempts for database operations
const MAX_RETRIES = 3;
// Base delay between retries in milliseconds
const BASE_RETRY_DELAY = 500;

// Mock data for development when database is unavailable
const mockDataCollections = {
  Menu: [],
  Reservation: [],
  Users: []
};

/**
 * Get MongoDB database connection with retry logic
 * @param {number} retryCount - Current retry attempt (used internally)
 * @returns {Promise<Object>} MongoDB database object
 */
export async function getDb(retryCount = 0) {
  try {
    console.log('Attempting to get MongoDB database connection');
    
    // Check if we should use mock data (connection failed)
    if (process.env.NODE_ENV === 'development' && await shouldUseMockData()) {
      console.log('Using mock database - MongoDB connection unavailable');
      return {
        collection: (name) => ({
          find: () => ({ toArray: async () => mockDataCollections[name] || [] }),
          findOne: async () => null,
          insertOne: async (doc) => {
            const id = new ObjectId();
            if (!mockDataCollections[name]) mockDataCollections[name] = [];
            mockDataCollections[name].push({ ...doc, _id: id });
            return { insertedId: id, acknowledged: true };
          },
          updateOne: async () => ({ matchedCount: 0, modifiedCount: 0 }),
          deleteOne: async () => ({ deletedCount: 0 })
        }),
        listCollections: () => ({ toArray: async () => [] }),
        createCollection: async () => {}
      };
    }
    
    const client = await clientPromise;
    
    if (!client) {
      throw new Error('MongoDB client is null - connection failed');
    }
    
    const db = client.db("DelbiResturant");
    console.log('Successfully connected to database: DelbiResturant');
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB database:', error);
    console.error('MongoDB error details:', {
      name: error.name,
      message: error.message,
      code: error.code || 'N/A',
      codeName: error.codeName || 'N/A'
    });
    
    // Authentication errors require manual fixing of credentials
    if (error.code === 8000 && error.codeName === 'AtlasError') {
      console.error('AUTHENTICATION FAILED: Please check your MongoDB Atlas username and password');
      console.error('Update your .env.local file with the correct credentials');
      throw new Error('MongoDB authentication failed - check credentials in .env.local');
    }
    
    // Check for common connection issues
    if (error.name === 'MongoServerSelectionError') {
      console.error('DATABASE ERROR: Could not connect to MongoDB server. This may be due to:');
      console.error('- Network connectivity issues');
      console.error('- MongoDB server is not running');
      console.error('- Authentication failed (check username/password)');
      console.error('- IP address not whitelisted in MongoDB Atlas');
    }
    
    // Implement retry logic for transient errors
    if (retryCount < MAX_RETRIES && (
        error.name === 'MongoNetworkError' || 
        error.name === 'MongoServerSelectionError' ||
        error.code === 'ECONNRESET'
      )) {
      const delay = BASE_RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`Retrying database connection in ${delay}ms (attempt ${retryCount + 1} of ${MAX_RETRIES})`);
      
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(getDb(retryCount + 1));
        }, delay);
      });
    }
    
    // If in development, return mock database instead of throwing
    if (process.env.NODE_ENV === 'development') {
      console.warn('FALLBACK: Using in-memory mock database due to connection failure');
      return {
        collection: (name) => ({
          find: () => ({ toArray: async () => mockDataCollections[name] || [] }),
          findOne: async () => null,
          insertOne: async (doc) => {
            const id = new ObjectId();
            if (!mockDataCollections[name]) mockDataCollections[name] = [];
            mockDataCollections[name].push({ ...doc, _id: id });
            return { insertedId: id, acknowledged: true };
          },
          updateOne: async () => ({ matchedCount: 0, modifiedCount: 0 }),
          deleteOne: async () => ({ deletedCount: 0 })
        }),
        listCollections: () => ({ toArray: async () => [] }),
        createCollection: async () => {}
      };
    }
    
    throw error;
  }
}

/**
 * Get a collection with error handling and retries
 * @param {string} collectionName - Name of the collection to access
 * @param {number} retryCount - Current retry attempt (used internally)
 * @returns {Promise<Object>} MongoDB collection object
 */
export async function getCollection(collectionName, retryCount = 0) {
  try {
    console.log(`Attempting to access collection: ${collectionName}`);
    const db = await getDb();
    
    // Ensure the collection exists, MongoDB will create it if it doesn't
    // This is to guarantee the collection exists before we try to use it
    const collections = await db.listCollections({name: collectionName}).toArray();
    if (collections.length === 0) {
      console.log(`Collection '${collectionName}' doesn't exist yet, it will be created automatically`);
      await db.createCollection(collectionName);
      console.log(`Created collection: ${collectionName}`);
    } else {
      console.log(`Collection '${collectionName}' found`);
    }
    
    const collection = db.collection(collectionName);
    console.log(`Successfully accessed collection: ${collectionName}`);
    return collection;
  } catch (error) {
    console.error(`Error accessing collection ${collectionName}:`, error);
    
    // Authentication errors are handled in getDb function
    if (error.message && error.message.includes('authentication failed')) {
      throw error;
    }
    
    // Implement retry logic for transient errors
    if (retryCount < MAX_RETRIES && (
        error.name === 'MongoNetworkError' || 
        error.name === 'MongoServerSelectionError' ||
        error.code === 'ECONNRESET'
      )) {
      const delay = BASE_RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`Retrying collection access in ${delay}ms (attempt ${retryCount + 1} of ${MAX_RETRIES})`);
      
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(getCollection(collectionName, retryCount + 1));
        }, delay);
      });
    }
    
    throw error;
  }
}

// Insert document into collection
export async function insertOne(collectionName, document) {
  try {
    console.log(`Inserting document into ${collectionName}:`, document);
    const collection = await getCollection(collectionName);
    
    // Add timestamp if not provided
    if (!document.createdAt) {
      document.createdAt = new Date();
    }
    
    const result = await collection.insertOne(document);
    console.log(`Successfully inserted document into ${collectionName}, ID:`, result.insertedId);
    return { 
      ...document, 
      _id: result.insertedId,
      _insertedAt: new Date()
    };
  } catch (error) {
    console.error(`Error inserting into ${collectionName}:`, error);
    console.error(`Document that failed to insert:`, JSON.stringify(document, null, 2));
    throw error;
  }
}

// Find documents in collection
export async function find(collectionName, query = {}, options = {}) {
  try {
    console.log(`Finding documents in ${collectionName} with query:`, query);
    const collection = await getCollection(collectionName);
    
    // Set default options for pagination
    const { 
      limit = 0, 
      skip = 0, 
      sort = { createdAt: -1 } 
    } = options;
    
    // Execute query with options
    const cursor = collection.find(query);
    
    // Apply sorting if specified
    if (sort) {
      cursor.sort(sort);
    }
    
    // Apply pagination if specified
    if (skip > 0) {
      cursor.skip(skip);
    }
    
    if (limit > 0) {
      cursor.limit(limit);
    }
    
    const results = await cursor.toArray();
    console.log(`Found ${results.length} documents in ${collectionName}`);
    return results;
  } catch (error) {
    console.error(`Error finding documents in ${collectionName}:`, error);
    throw error;
  }
}

// Find one document in collection
export async function findOne(collectionName, query) {
  try {
    console.log(`Finding a document in ${collectionName} with query:`, query);
    
    // Convert string IDs to ObjectId if _id is specified
    if (query._id && typeof query._id === 'string') {
      try {
        query._id = new ObjectId(query._id);
      } catch (err) {
        console.warn('Invalid ObjectId format:', query._id);
      }
    }
    
    const collection = await getCollection(collectionName);
    const result = await collection.findOne(query);
    console.log(`Document found in ${collectionName}:`, !!result);
    return result;
  } catch (error) {
    console.error(`Error finding document in ${collectionName}:`, error);
    throw error;
  }
}

// Update document in collection
export async function updateOne(collectionName, query, update) {
  try {
    console.log(`Updating a document in ${collectionName} with query:`, JSON.stringify(query));
    console.log(`Update data:`, JSON.stringify(update));
    
    // Convert string IDs to ObjectId if _id is specified
    if (query._id && typeof query._id === 'string') {
      try {
        query._id = new ObjectId(query._id);
      } catch (err) {
        console.warn('Invalid ObjectId format:', query._id);
      }
    }
    
    const collection = await getCollection(collectionName);
    
    // Add updated timestamp
    if (!update.updatedAt) {
      update.updatedAt = new Date();
    }
    
    const result = await collection.updateOne(query, { $set: update });
    console.log(`Updated ${result.matchedCount} document(s) in ${collectionName}`);
    return result;
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
}

// Delete document from collection
export async function deleteOne(collectionName, query) {
  try {
    console.log(`Deleting a document in ${collectionName} with query:`, JSON.stringify(query));
    
    // Convert string IDs to ObjectId if _id is specified
    if (query._id && typeof query._id === 'string') {
      try {
        query._id = new ObjectId(query._id);
      } catch (err) {
        console.warn('Invalid ObjectId format:', query._id);
      }
    }
    
    const collection = await getCollection(collectionName);
    const result = await collection.deleteOne(query);
    console.log(`Deleted ${result.deletedCount} document(s) in ${collectionName}`);
    return result;
  } catch (error) {
    console.error(`Error deleting document in ${collectionName}:`, error);
    throw error;
  }
} 