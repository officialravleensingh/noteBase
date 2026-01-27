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
    console.log('Attempting to send email to:', email, 'OTP:', otp, 'Type:', type);
    
    let subject, message;
    
    switch (type) {
      case 'signup':
        subject = 'Verify Your Email - NoteBase';
        message = `Your verification code is: ${otp}. This code will expire in 10 minutes.`;
        break;
      case 'password-reset':
        subject = 'Reset Your Password - NoteBase';
        message = `Your password reset code is: ${otp}. This code will expire in 10 minutes.`;
        break;
      case 'profile-update':
        subject = 'Verify Profile Update - NoteBase';
        message = `Your profile update verification code is: ${otp}. This code will expire in 10 minutes.`;
        break;
      case 'password-change':
        subject = 'Verify Password Change - NoteBase';
        message = `Your password change verification code is: ${otp}. This code will expire in 10 minutes.`;
        break;
      case 'note-unlock':
        subject = 'Unlock Note - NoteBase';
        message = `Your note unlock verification code is: ${otp}. This code will expire in 10 minutes.`;
        break;
      case 'section-pin-reset':
        subject = 'Reset Section PIN - NoteBase';
        message = `Your section PIN reset verification code is: ${otp}. This code will expire in 10 minutes.`;
        break;
      case 'profile-deletion':
        subject = 'Profile Deletion Verification - NoteBase';
        message = `Your profile deletion verification code is: ${otp}. This code will expire in 10 minutes. WARNING: This will schedule your account for permanent deletion in 7 days.`;
        break;
      case 'memory-delete':
        subject = 'Delete Memory - NoteBase';
        message = `Your memory deletion verification code is: ${otp}. This code will expire in 10 minutes.`;
        break;
      case 'journal-delete':
        subject = 'Delete Journal Entry - NoteBase';
        message = `Your journal entry deletion verification code is: ${otp}. This code will expire in 10 minutes.`;
        break;
      default:
        subject = 'Verification Code - NoteBase';
        message = `Your verification code is: ${otp}. This code will expire in 10 minutes.`;
    }
    
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
    
    console.log('Sending email with options:', { from: mailOptions.from, to: mailOptions.to, subject: mailOptions.subject });
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

const sendEmail = async (email, type, data) => {
  try {
    const templates = {
      'signup': {
        subject: 'Verify Your Email - NoteBase',
        message: `Your verification code is: ${data.otp}. This code will expire in 10 minutes.`
      },
      'password-reset': {
        subject: 'Reset Your Password - NoteBase',
        message: `Your password reset code is: ${data.otp}. This code will expire in 10 minutes.`
      },
      'profile-update': {
        subject: 'Verify Profile Update - NoteBase',
        message: `Your profile update verification code is: ${data.otp}. This code will expire in 10 minutes.`
      },
      'password-change': {
        subject: 'Verify Password Change - NoteBase',
        message: `Your password change verification code is: ${data.otp}. This code will expire in 10 minutes.`
      },
      'note-unlock': {
        subject: 'Unlock Note - NoteBase',
        message: `Your note unlock verification code is: ${data.otp}. This code will expire in 10 minutes.`
      },
      'pin-setup': {
        subject: `Set ${data.section} Section PIN - NoteBase`,
        message: `Your ${data.section} section PIN setup verification code is: ${data.otp}. This code will expire in 10 minutes.`
      },
      'memory-delete': {
        subject: 'Delete Memory - NoteBase',
        message: `Your memory "${data.memoryTitle}" deletion verification code is: ${data.otp}. This code will expire in 10 minutes.`
      },
      'journal-delete': {
        subject: 'Delete Journal Entry - NoteBase',
        message: `Your journal entry for ${data.entryDate} deletion verification code is: ${data.otp}. This code will expire in 10 minutes.`
      },
      'permanent-delete': {
        subject: 'Permanent Delete Item - NoteBase',
        message: `Your ${data.itemType} "${data.itemTitle}" permanent deletion verification code is: ${data.otp}. This code will expire in 10 minutes.`
      },
      'empty-recycle-bin': {
        subject: 'Empty Recycle Bin - NoteBase',
        message: `Your recycle bin emptying verification code is: ${data.otp}. This will permanently delete ${data.itemCount} items. This code will expire in 10 minutes.`
      },
      'reminder-delete': {
        subject: 'Delete Reminder - NoteBase',
        message: `Your reminder "${data.reminderTitle}" deletion verification code is: ${data.otp}. This code will expire in 10 minutes.`
      },
      'reminder-notification': {
        subject: 'Reminder Notification - NoteBase',
        message: `Reminder: ${data.reminderTitle}. ${data.description ? data.description : ''} Scheduled for ${data.datetime}.`
      },
      'feature-toggle': {
        subject: `${data.action === 'enable' ? 'Enable' : 'Disable'} ${data.feature} Section - NoteBase`,
        message: `Your ${data.feature} section ${data.action} verification code is: ${data.otp}. ${data.action === 'disable' ? 'WARNING: This will permanently delete all data in this section.' : ''} This code will expire in 10 minutes.`
      }
    };

    const template = templates[type] || {
      subject: 'Verification Code - NoteBase',
      message: `Your verification code is: ${data.otp}. This code will expire in 10 minutes.`
    };
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: template.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">NoteBase</h2>
          <p>Hello ${data.name || ''},</p>
          <p>${template.message}</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2563eb; margin: 0; font-size: 32px; letter-spacing: 5px;">${data.otp}</h1>
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
  sendOTPEmail,
  sendEmail
};