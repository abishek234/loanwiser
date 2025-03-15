const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

let transporter; 

async function configureTransporter() {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates (optional)
    },
  });

  try {
    await transporter.verify();
    console.log("✅ SMTP connection established successfully.");
  } catch (err) {
    console.error("❌ SMTP connection failed:", err);
    console.error("Error stack trace:", err.stack);
  }
}

configureTransporter(); 



const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html
    };
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};


const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


const validatePassword = (password) => {

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
  
};

module.exports = {
  generateOTP,
  sendEmail,
  validateEmail,
  validatePassword
};