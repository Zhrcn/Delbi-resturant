import nodemailer from 'nodemailer';
import { getCollection } from '../../lib/db';

// Create a test account and get credentials
async function createTestAccount() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('Test account created:', testAccount);
    return {
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    };
  } catch (err) {
    console.error('Failed to create test account:', err);
    return null;
  }
}

// Create a transport configuration function to handle credentials properly
const createTransporter = async () => {
  // Validate email credentials
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Missing email configuration. Creating test account for development');
    
    // Create test credentials and return test transporter
    const testConfig = await createTestAccount();
    if (testConfig) {
      const testTransporter = nodemailer.createTransport(testConfig);
      return testTransporter;
    }
    
    throw new Error('Could not create email transport. Please check EMAIL_USER and EMAIL_PASSWORD environment variables');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Add better error handling
    tls: {
      rejectUnauthorized: true
    }
  });
};

// Generate verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email template function
const createEmailTemplate = (name, verificationCode) => {
  return `
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
  `;
};

export default async function handler(req, res) {
  // Validate request method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Validate request body
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({ 
      error: 'بيانات غير كافية',
      details: 'Email and name are required' 
    });
  }

  // Generate verification code for testing
  const verificationCode = generateVerificationCode();
  
  // Try to store in memory for testing (session storage would be better but this is just for debugging)
  try {
    // Store in global object for testing purposes only
    if (typeof global.verificationCodes === 'undefined') {
      global.verificationCodes = {};
    }
    
    global.verificationCodes[email] = {
      code: verificationCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    };
    
    console.log(`[TEST MODE] Code for ${email}: ${verificationCode}`);
    
    // Always return success in test mode
    return res.status(200).json({ 
      message: 'تم إرسال رمز التحقق بنجاح (TEST MODE)',
      email: email,
      testCode: verificationCode // For testing only - REMOVE IN PRODUCTION
    });
  } catch (error) {
    console.error('Error in test mode:', error);
    return res.status(500).json({ 
      error: 'حدث خطأ أثناء إرسال رمز التحقق',
      details: error.message 
    });
  }

  // Original implementation with database storage and email sending is commented out for debugging
  /*
  try {
    // Create email transporter
    const transporter = await createTransporter();
    
    // Generate verification code
    const verificationCode = generateVerificationCode();
    
    // Store verification code in database with proper error handling
    try {
      console.log('Attempting to get collection: VerificationCodes');
      const collection = await getCollection('VerificationCodes');
      
      // Check if collection exists/is accessible
      if (!collection) {
        throw new Error('Collection VerificationCodes not accessible');
      }
      
      console.log('Cleaning up existing verification codes for the email');
      // Clean up existing verification codes for the email
      await collection.deleteMany({ 
        email,
        createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Delete codes older than 24 hours
      });
      
      console.log('Inserting new verification code');
      // Insert new verification code
      await collection.insertOne({
        email,
        code: verificationCode,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
      });
      
      console.log('Verification code stored successfully');
    } catch (dbError) {
      console.error('Database error details:', {
        message: dbError.message,
        stack: dbError.stack,
        name: dbError.name,
        code: dbError.code
      });
      
      // Try to use email without storing to database
      console.log('Attempting to proceed with email only (bypassing database storage)');
      return res.status(500).json({ 
        error: 'حدث خطأ في قاعدة البيانات',
        details: dbError.message 
      });
    }

    // Send the verification code via email
    const mailOptions = {
      from: `"Delbi Restaurant" <${process.env.EMAIL_USER || 'test@example.com'}>`,
      to: email,
      subject: 'Your Reservation Verification Code - Delbi Restaurant',
      html: createEmailTemplate(name, verificationCode),
    };

    try {
      console.log('Sending email with options:', {
        to: mailOptions.to,
        from: mailOptions.from,
        subject: mailOptions.subject
      });
      
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', {
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info)
      });
    } catch (emailError) {
      console.error('Email sending error details:', {
        error: emailError,
        message: emailError.message,
        code: emailError.code,
        command: emailError.command,
        responseCode: emailError.responseCode,
        response: emailError.response
      });
      return res.status(500).json({ 
        error: 'حدث خطأ أثناء إرسال البريد الإلكتروني',
        details: emailError.message 
      });
    }

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
  */
} 