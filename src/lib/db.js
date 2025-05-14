import clientPromise from './mongodb';

export async function getDb() {
  const client = await clientPromise;
  return client.db("delbi_restaurant");
}

export async function getCollection(collectionName) {
  const db = await getDb();
  return db.collection(collectionName);
}

// مثال على دالة لإضافة عنصر جديد
export async function insertOne(collectionName, document) {
  const collection = await getCollection(collectionName);
  return collection.insertOne(document);
}

// مثال على دالة للحصول على جميع العناصر
export async function find(collectionName, query = {}) {
  const collection = await getCollection(collectionName);
  return collection.find(query).toArray();
}

// مثال على دالة للحصول على عنصر واحد
export async function findOne(collectionName, query) {
  const collection = await getCollection(collectionName);
  return collection.findOne(query);
}

// مثال على دالة لتحديث عنصر
export async function updateOne(collectionName, query, update) {
  const collection = await getCollection(collectionName);
  return collection.updateOne(query, { $set: update });
}

// مثال على دالة لحذف عنصر
export async function deleteOne(collectionName, query) {
  const collection = await getCollection(collectionName);
  return collection.deleteOne(query);
} 