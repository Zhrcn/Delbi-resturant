import clientPromise from './mongodb';

export async function getDb() {
  try {
    console.log('Attempting to get MongoDB database connection');
    const client = await clientPromise;
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
    
    // Check for common connection issues
    if (error.name === 'MongoServerSelectionError') {
      console.error('DATABASE ERROR: Could not connect to MongoDB server. This may be due to:');
      console.error('- Network connectivity issues');
      console.error('- MongoDB server is not running');
      console.error('- Authentication failed (check username/password)');
      console.error('- IP address not whitelisted in MongoDB Atlas');
    }
    
    throw error;
  }
}

export async function getCollection(collectionName) {
  try {
    console.log(`Attempting to access collection: ${collectionName}`);
    const db = await getDb();
    
    // Ensure the collection exists, MongoDB will create it if it doesn't
    // This is to guarantee the collection exists before we try to use it
    const collections = await db.listCollections({name: collectionName}).toArray();
    if (collections.length === 0) {
      console.log(`Collection '${collectionName}' doesn't exist yet, it will be created automatically`);
    } else {
      console.log(`Collection '${collectionName}' found`);
    }
    
    const collection = db.collection(collectionName);
    console.log(`Successfully accessed collection: ${collectionName}`);
    return collection;
  } catch (error) {
    console.error(`Error accessing collection ${collectionName}:`, error);
    throw error;
  }
}

// مثال على دالة لإضافة عنصر جديد
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

// مثال على دالة للحصول على جميع العناصر
export async function find(collectionName, query = {}) {
  try {
    console.log(`Finding documents in ${collectionName} with query:`, query);
    const collection = await getCollection(collectionName);
    const results = await collection.find(query).toArray();
    console.log(`Found ${results.length} documents in ${collectionName}`);
    return results;
  } catch (error) {
    console.error(`Error finding documents in ${collectionName}:`, error);
    throw error;
  }
}

// مثال على دالة للحصول على عنصر واحد
export async function findOne(collectionName, query) {
  try {
    console.log(`Finding a document in ${collectionName} with query:`, query);
    const collection = await getCollection(collectionName);
    const result = await collection.findOne(query);
    console.log(`Document found in ${collectionName}:`, !!result);
    return result;
  } catch (error) {
    console.error(`Error finding document in ${collectionName}:`, error);
    throw error;
  }
}

// مثال على دالة لتحديث عنصر
export async function updateOne(collectionName, query, update) {
  try {
    console.log(`Updating a document in ${collectionName} with query:`, JSON.stringify(query));
    console.log(`Update data:`, JSON.stringify(update));
    const collection = await getCollection(collectionName);
    update.updatedAt = new Date(); // Add updated timestamp
    const result = await collection.updateOne(query, { $set: update });
    console.log(`Updated ${result.matchedCount} document(s) in ${collectionName}`);
    return result;
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
}

// مثال على دالة لحذف عنصر
export async function deleteOne(collectionName, query) {
  try {
    console.log(`Deleting a document in ${collectionName} with query:`, JSON.stringify(query));
    console.log(`Query type of _id:`, query._id ? typeof query._id : 'undefined');
    console.log(`Query _id constructor:`, query._id ? query._id.constructor.name : 'undefined');
    
    const collection = await getCollection(collectionName);
    const result = await collection.deleteOne(query);
    console.log(`Deleted ${result.deletedCount} document(s) in ${collectionName}`);
    return result;
  } catch (error) {
    console.error(`Error deleting document in ${collectionName}:`, error);
    throw error;
  }
} 