import nodemailer from 'nodemailer';
import { getCollection } from '../../lib/db';

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, name } = req.body;
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the verification code in the database
    const collection = await getCollection('verification_codes');
    await collection.insertOne({
      email,
      code: verificationCode,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
    });

    // Send the verification code via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Reservation Verification Code - Delbi Restaurant',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">مرحباً ${name},</h2>
          <p>شكراً لتسجيل حجزك في مطعم ديلبي. يرجى استخدام رمز التحقق التالي لإكمال عملية الحجز:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2d3748; margin: 0; font-size: 32px;">${verificationCode}</h1>
          </div>
          <p>ينتهي هذا الرمز خلال 10 دقائق.</p>
          <p>إذا لم تقم بطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.</p>
          <p>مع تحيات،<br>فريق مطعم ديلبي</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'تم إرسال رمز التحقق بنجاح',
      email: email // Send back the email for reference
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء إرسال رمز التحقق',
      details: error.message 
    });
  }
} 