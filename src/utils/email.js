import nodemailer from 'nodemailer';

// Create a reusable transporter object using SMTP transport
async function createTransporter() {
  let transporter;
  
  // If we're in development/test mode, use ethereal for testing
  if (process.env.NODE_ENV !== 'production') {
    // Create test account
    const testAccount = await nodemailer.createTestAccount();
    
    // Create a testing transporter
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    console.log('Using test email account:', testAccount.user);
  } else {
    // Create production transporter using environment variables
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  
  return transporter;
}

// Email templates
function createReservationStatusEmail(name, status, date, time) {
  const statusMessages = {
    pending: 'We have received your reservation request and it is currently under review. We will notify you once it has been confirmed.',
    confirmed: 'We are pleased to inform you that your reservation has been confirmed! We look forward to serving you.',
    cancelled: 'Your reservation has been cancelled. If you did not request this cancellation, please contact us.',
    completed: 'Thank you for dining with us! We hope you enjoyed your experience.'
  };

  const statusTitles = {
    pending: 'Reservation Request Received',
    confirmed: 'Reservation Confirmed',
    cancelled: 'Reservation Cancelled',
    completed: 'Thank You for Dining With Us'
  };

  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
        <h1 style="color: #333; margin-bottom: 5px;">${statusTitles[status] || 'Reservation Update'}</h1>
      </div>
      <div style="padding: 20px 0;">
        <p>Dear ${name},</p>
        <p>${statusMessages[status] || 'Your reservation status has been updated.'}</p>
        <p>Reservation Details:</p>
        <ul>
          <li>Date: ${formattedDate}</li>
          <li>Time: ${time}</li>
          <li>Status: <strong>${status.charAt(0).toUpperCase() + status.slice(1)}</strong></li>
        </ul>
        <p>If you have any questions or need to make changes, please contact us.</p>
      </div>
      <div style="padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center; color: #666; font-size: 14px;">
        <p>Delbi Restaurant</p>
        <p>Thank you for choosing us!</p>
      </div>
    </div>
  `;
}

// Function to send status update email
export async function sendStatusUpdateEmail(reservation) {
  try {
    const { name, email, date, time, status } = reservation;
    
    if (!email) {
      console.warn('Cannot send status update email: no email address provided');
      return { success: false, error: 'No email address provided' };
    }
    
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: `"Delbi Restaurant" <${process.env.EMAIL_USER || 'reservations@delbirestaurant.com'}>`,
      to: email,
      subject: `Reservation ${status.charAt(0).toUpperCase() + status.slice(1)}: Delbi Restaurant`,
      html: createReservationStatusEmail(name, status, date, time),
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // For test accounts, log the URL where the message can be viewed
    if (process.env.NODE_ENV !== 'production') {
      console.log('Email preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return { 
      success: true, 
      messageId: info.messageId,
      previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
    };
  } catch (error) {
    console.error('Error sending status update email:', error);
    return { success: false, error: error.message };
  }
}

export default {
  sendStatusUpdateEmail
}; 