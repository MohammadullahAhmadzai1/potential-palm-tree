const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Ensure this path is correct
const {auth} = require('../middleware/auth');
const Vendor = require('../models/vendor');
const authRoute = express.Router();

// Route for user signup
authRoute.post('/api/signup', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        
        //check if the account has been created by a vendor before
        const existingVendorEmail = await Vendor.findOne({email});
        if(existingVendorEmail){
          return res.status(400).json({msg:"Account already own by a vendor"});
        }
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
        return res.status(400).json({success:false, msg: "User not found with this email" });
      }else{
      // 2. Compare passwords (ensure passwords are hashed during signup)
      const isMatch = await bcrypt.compare(password, findUser.password);
      if (!isMatch) {
        return res.status(400).json({success:false, msg: "Incorrect password" });
      }else{
        // 3. Generate JWT token (with secret and expiration)
      const token = jwt.sign(
        { id: findUser._id },
        "passwordKey", // Add the secret key here
        {expiresIn: '30d'},//set the token expires in 1 minute
      );
  
      // 4. Remove password from response
      const { password: _, ...userWithoutPassword } = findUser._doc;
  
      // 5. Send token and user data
      res.json({ 
        success: true,
        token, 
        userWithoutPassword 
      });
      }
    }      
    } catch (error) {
      // Handle errors properly
      res.status(500).json({ error: error.message });
    }

  });

  //Define a Get route for the authentication router
  authRoute.get('/',auth, async(req, res)=>{
    try {
      //Retrieve the user data from the database using the id from the authenticated user
      const user = await User.findById(req.user);
    
      //send the user data as json response, including all the document fields and the token
      res.json({...user._doc, token: req.token});
    } catch (e) {
      return res.status(500).json({error: e.message});
    }    
  });

  //check token validity
  authRoute.post('/tokenIsValid', async(req, res)=>{
    try {
      const token = req.header("x-auth-token");
      if(!token){
        return res.json(false);//if no token, return false
      }
      //verify the token 
      const verified = jwt.verify(token, "passwordKey");
      if(!verified) return res.json(false);
      //if verification failed(expired or invalid)
      const user = await User.findById(verified.id);

      if(!user) return res.json(false);
      
      //if everything is valid return true
      return res.json(true);
    } catch (e) {
      //if jwt.verify fails or other errors occurs, return false
      return res.status(500).json({error: e.message}); 
    }
  })

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
  //Delete user or vendor Api
  authRoute.delete('/api/user/delete-account/:id',auth,async(req, res)=>{
    try {
      const {id} = req.params;
      const user = await User.findById(id);
      const vendor = await Vendor.findById(id);

      if(!user && !vendor){
        return res.status(404).json({msg:"User or Vendor not found"});
      }
      //Delete the user or vendor based on their type
      if(user){
        await User.findByIdAndDelete(id);
      }else if(vendor){
        await Vendor.findByIdAndDelete(id);
      }
      return res.status(200).json({msg:"User deleted successfully"});
    } catch (e) {
      return res.status(500).json({error:e.message});
    }
  });
module.exports = authRoute;