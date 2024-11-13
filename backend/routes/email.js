const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')
const User = require('../models/emailSchema')
const crypto = require('crypto')
const { log } = require('console')
const { env } = require('process')
require('dotenv').config()

//Configure nodemailer

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // Use true for Yahoo (port 465 uses SSL/TLS)
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
})

transporter.verify(function(error, success) {
  if (error) {
    console.log("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
})

//Send Mcrypto.ail
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    // Generate OTP and expiration time
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    console.log(otpExpiresAt)

    let user = await User.findOne({ email });
    if (!user) {
        user = new User({ email, otp, otpExpiresAt });
    } else {
        user.otp = otp;
        user.otpExpiresAt = otpExpiresAt;
    }

    await user.save();

    // Send OTP via email
    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`,
    });

    res.json({ message: 'OTP sent to your email' });
});

// Route to verify OTP
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiresAt < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.json({ message: 'Login successful' });
})
module.exports = router