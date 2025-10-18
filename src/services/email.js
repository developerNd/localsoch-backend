const nodemailer = require('nodemailer');

// Email configuration
const createTransporter = () => {
  // Check if email is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    return null;
  }

  // For development, you can use Gmail SMTP or other services
  // For production, consider using SendGrid, Mailgun, or AWS SES
  
  const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to other services
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Use app password for Gmail
    }
  });

  return transporter;
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      return { success: false, error: 'Email service not configured' };
    }
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?code=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@localsoch.com',
      to: email,
      subject: 'Password Reset - Local Soch',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">Local Soch</h1>
            <p style="color: #666; margin: 10px 0 0 0;">Your Local Marketplace</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You requested a password reset for your Local Soch account. Click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Or copy and paste this link in your browser:
            </p>
            
            <p style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all; color: #333;">
              ${resetUrl}
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-top: 30px;">
              <strong>Important:</strong> This link will expire in 1 hour for security reasons.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              © 2024 Local Soch. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        Password Reset - Local Soch
        
        You requested a password reset for your Local Soch account.
        
        Click this link to reset your password: ${resetUrl}
        
        This link will expire in 1 hour for security reasons.
        
        If you didn't request this password reset, please ignore this email.
        
        © 2024 Local Soch. All rights reserved.
      `
    };

    const result = await transporter.sendMail(mailOptions);

    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset OTP email
const sendPasswordResetOTP = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      return { success: false, error: 'Email service not configured' };
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@localsoch.com',
      to: email,
      subject: 'Password Reset OTP - Local Soch',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">Local Soch</h1>
            <p style="color: #666; margin: 10px 0 0 0;">Your Local Marketplace</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset OTP</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You requested a password reset for your Local Soch account. Use the OTP below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #007bff; color: white; padding: 20px; border-radius: 10px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Enter this OTP in the app to reset your password.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-top: 30px;">
              <strong>Important:</strong> This OTP will expire in 10 minutes for security reasons.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              © 2024 Local Soch. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        Password Reset OTP - Local Soch
        
        You requested a password reset for your Local Soch account.
        
        Your OTP is: ${otp}
        
        Enter this OTP in the app to reset your password.
        
        This OTP will expire in 10 minutes for security reasons.
        
        If you didn't request this password reset, please ignore this email.
        
        © 2024 Local Soch. All rights reserved.
      `
    };

    const result = await transporter.sendMail(mailOptions);

    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Error sending password reset OTP:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email (optional)
const sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      return { success: false, error: 'Email service not configured' };
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@localsoch.com',
      to: email,
      subject: 'Welcome to Local Soch!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">Welcome to Local Soch!</h1>
            <p style="color: #666; margin: 10px 0 0 0;">Your Local Marketplace</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${username}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Welcome to Local Soch! We're excited to have you join our local marketplace community.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You can now:
            </p>
            
            <ul style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              <li>Browse products from local vendors</li>
              <li>Place orders and track deliveries</li>
              <li>Discover great deals and offers</li>
              <li>Support your local community</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Start Shopping
              </a>
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              © 2024 Local Soch. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);

    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendPasswordResetOTP,
  sendWelcomeEmail
};