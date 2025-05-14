import { getCollection } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, code } = req.body;
    const collection = await getCollection('verification_codes');
    
    // Find the verification code
    const verification = await collection.findOne({
      email,
      code,
      expiresAt: { $gt: new Date() } // Check if the code hasn't expired
    });

    if (!verification) {
      return res.status(400).json({ 
        error: 'رمز التحقق غير صحيح أو منتهي الصلاحية'
      });
    }

    // Delete the used verification code
    await collection.deleteOne({ _id: verification._id });

    res.status(200).json({ 
      message: 'تم التحقق بنجاح'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'حدث خطأ أثناء التحقق',
      details: error.message 
    });
  }
} 