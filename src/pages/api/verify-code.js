import { getCollection } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, code } = req.body;
    
    // TEST MODE: Check in-memory verification codes
    if (global.verificationCodes && global.verificationCodes[email]) {
      const storedVerification = global.verificationCodes[email];
      
      console.log(`[TEST MODE] Verification attempt for ${email}:`, {
        storedCode: storedVerification.code,
        receivedCode: code,
        storedCodeType: typeof storedVerification.code,
        receivedCodeType: typeof code,
        expired: storedVerification.expiresAt <= new Date()
      });
      
      // Check if code matches and hasn't expired
      if (storedVerification.code.toString() === code.toString() && storedVerification.expiresAt > new Date()) {
        // Delete the used verification code
        delete global.verificationCodes[email];
        
        console.log(`[TEST MODE] Successfully verified code for ${email}`);
        return res.status(200).json({ 
          message: 'تم التحقق بنجاح'
        });
      }
      
      console.log(`[TEST MODE] Invalid code for ${email}`);
      return res.status(400).json({ 
        error: 'رمز التحقق غير صحيح أو منتهي الصلاحية'
      });
    }
    
    // If not found in memory, try database
    try {
      const collection = await getCollection('VerificationCodes');
      
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
  
      return res.status(200).json({ 
        message: 'تم التحقق بنجاح'
      });
    } catch (dbError) {
      console.error('Database error during verification:', dbError);
      return res.status(500).json({ 
        error: 'حدث خطأ أثناء التحقق من قاعدة البيانات',
        details: dbError.message 
      });
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء التحقق',
      details: error.message 
    });
  }
} 