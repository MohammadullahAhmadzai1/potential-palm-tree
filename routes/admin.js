const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const express = require('express');
const adminRoute = express.Router();
// Admin Signup (Should be protected in production)
adminRoute.post('/api/admin/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // 🔒 Critical: Check if ANY admin already exists
    const existingAdminCount = await Admin.countDocuments();
    if (existingAdminCount > 0) {
      return res.status(400).json({
        success: false,
        msg: "Only one admin account is allowed. An admin already exists."
      });
    }

    // Check for duplicate email (optional but recommended)
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        msg: "Admin with this email already exists"
      });
    }

    // ... rest of your signup logic (hashing, saving, token generation) ...
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      fullName,
      email,
      password: hashedPassword
    });

    await newAdmin.save();

    const token = jwt.sign(
      { id: newAdmin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const { password: _, ...adminWithoutPassword } = newAdmin._doc;

    res.status(201).json({
      success: true,
      token,
      admin: adminWithoutPassword
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
adminRoute.post('/api/admin/signin', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find admin
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(404).json({
          success: false,
          msg: "Admin not found"
        });
      }
  
      // Verify password
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          msg: "Invalid credentials"
        });
      }
  
      // Generate JWT
      const token = jwt.sign(
        { id: admin._id, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
  
      // Remove password from response
      const { password: _, ...adminWithoutPassword } = admin._doc;
  
      res.json({
        success: true,
        token,
        admin: adminWithoutPassword
      });
  
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  module.exports = adminRoute;