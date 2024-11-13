// routes/otp.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const Otp = require('../models/otpModel');
const User = require('../models/userModel')

router.post('/generate', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in the User collection (optional)
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
      await user.save();
    }

    // Generate a random OTP (here, we'll just use the first 6 characters of a UUID)
    const otpCode = uuidv4().slice(0, 6);

    // Save OTP to the database with expiration
    const otp = new Otp({ email, otp: otpCode });
    await otp.save();

    // Send OTP via Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otpCode}. It will expire in 5 minutes.`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent to your email!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating OTP' });
  }
});

// routes/otp.js
router.post('/verify', async (req, res) => {
    const { email, otp } = req.body;
  
    try {
      // Find the OTP record by email
      const otpRecord = await Otp.findOne({ email });
  
      // Check if OTP exists and matches
      if (!otpRecord || otpRecord.otp !== otp) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
  
      // OTP is correct, proceed with additional logic if needed (e.g., user authentication)
      res.status(200).json({ message: 'OTP verified successfully' });
  
      // Optionally, delete the OTP after verification
      await Otp.deleteOne({ email });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error verifying OTP' });
    }
  });
  
  module.exports = router;
  

module.exports = router;
