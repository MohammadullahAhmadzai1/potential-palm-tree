const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Ensure this path is correct
const user = require('../models/user');
const authRoute = express.Router();

// Route for user signup
authRoute.post('/api/signup', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        // Fix: Use uppercase "User"
        const existingEmail = await User.findOne({ email }); // ✅ Corrected
        if (existingEmail) {
            return res.status(400).json({ msg: "User with same email already exists" });
        } else {
            //random String
        const salt = await bcrypt.genSalt(10);
            //hashing password
        const hashingPassword = await bcrypt.hash(password, salt);
            let user = new User({ fullName, email, password:hashingPassword }); // Use "const" instead of "var"
            await user.save();
            res.json({ user });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

authRoute.post('/api/signin', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // 1. Find user by email
      const findUser = await User.findOne({ email });
      if (!findUser) {
        return res.status(400).json({ msg: "User not found with this email" });
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
      const { password: _, ...userWithoutPassword } = findUser._doc;
  
      // 5. Send token and user data
      res.json({ 
        token, 
        user: userWithoutPassword 
      });
      }
    }      
    } catch (error) {
      // Handle errors properly
      res.status(500).json({ error: error.message });
    }

  });
  //put route for updating user's state, city and locality
  authRoute.put('/api/users/:id', async(req, res)=>{
    try {
      //Extract the 'id' parameter from the request Url 
      const {id}=req.params;
      //Extract the 'state', 'city' and 'locality' fields from the request body
      const {state, city, locality}=req.body;
      //find the user by their ID and update the state, city and locality fields
      // the {new:true} option ensures the updated document is returned
      const updatedUser = await User.findByIdAndUpdate(
        id,
        {state, city, locality},
        {new:true},
      );
      //if no user is found return 404 page not found status with an error message
      if(!updatedUser){
        return res.status(404).json({error: "User not found"});
      }
      return res.status(200).json(updatedUser);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  //Fetch all users(exclude password)
  authRoute.get('/api/users', async(req, res)=>{
    try{
      const users = await User.find().select('-password');
      return res.status(200).json(users);
    }catch(e){
      res.status(500).json({error: e.message});

    }
  });
module.exports = authRoute;