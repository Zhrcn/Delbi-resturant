import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("delbi_restaurant"); // اسم قاعدة البيانات الخاصة بك
    
    // اختبار الاتصال
    const collections = await db.listCollections().toArray();
    
    res.status(200).json({ 
      message: "تم الاتصال بقاعدة البيانات بنجاح",
      collections: collections 
    });
  } catch (error) {
    res.status(500).json({ 
      error: "حدث خطأ في الاتصال بقاعدة البيانات",
      details: error.message 
    });
  }
} 