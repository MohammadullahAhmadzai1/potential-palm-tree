const express = require('express');
const Vendor = require('../models/vendor').default;
const vendorRouter = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Add middleware for JSON parsing
vendorRouter.use(express.json());

vendorRouter.post('/api/vendor/signup', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Validate required fields
        if (!fullName || !email || !password) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        // Check for existing vendor
        const existingVendor = await Vendor.findOne({ email });
        if (existingVendor) {
            return res.status(400).json({ msg: "Vendor with this email already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new vendor
        const vendor = new Vendor({
            fullName,
            email,
            password: hashedPassword
        });

        await vendor.save();
        
        // Remove password from response
        const vendorResponse = vendor.toObject();
        delete vendorResponse.password;

        res.status(201).json({ vendor: vendorResponse });

    } catch (e) {
        console.error("Signup Error:", e);
        res.status(500).json({ error: "Internal server error" });
    }
});

vendorRouter.post('/api/vendor/signin', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // 1. Find user by email
      const findUser = await Vendor.findOne({ email });
      if (!findUser) {
        return res.status(400).json({ msg: "Vendor not found with this email" });
      }else{
      // 2. Compare passwords (ensure passwords are hashed during signup)
      const isMatch = await bcrypt.compare(password, findUser.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Incorrect password" });
      }else{
        // 3. Generate JWT token (with secret and expiration)
      const token = jwt.sign(
        { id: findUser._id },
        process.env.JWT_SECRET, // Add the secret key here
      );
  
      // 4. Remove password from response
      const { password: _, ...vendorWithoutPassword } = findUser._doc;
  
      // 5. Send token and user data
      res.json({ 
        token, 
        vendor: vendorWithoutPassword 
      });
      }
    }      
    } catch (error) {
      // Handle errors properly
      res.status(500).json({ error: error.message });
    }
  });

vendorRouter.get('/api/vendors', async(req, res)=>{
    try {
      const vendors = await Vendor.find().select('-password');
      return res.status(200).json(vendors);
    } catch (e) {
      res.status(500).json({error: e.message});
    }
});
module.exports = vendorRouter;