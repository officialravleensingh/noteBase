const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail = async (email, otp, type) => {
  try {
    const subject = type === 'signup' ? 'Verify Your Email - NoteBase' : 'Reset Your Password - NoteBase';
    const message = type === 'signup' 
      ? `Your verification code is: ${otp}. This code will expire in 10 minutes.`
      : `Your password reset code is: ${otp}. This code will expire in 10 minutes.`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">NoteBase</h2>
          <p>Hello,</p>
          <p>${message}</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2563eb; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>NoteBase Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

module.exports = {
  sendOTPEmail
};