const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Ensure this path is correct
const {auth} = require('../middleware/auth');
const authRoute = express.Router();

// Route for user signup
// authRoute.post('/api/signup', async (req, res) => {
//     try {
//         const { fullName, email, password } = req.body;
//         const existingEmail = await User.findOne({ email }); // ✅ Corrected
//         if (existingEmail) {
//             return res.status(400).json({success:false, msg: "User with same email already exists" });
//         } else {
//             //random String
//         const salt = await bcrypt.genSalt(10);
//             //hashing password
//         const hashingPassword = await bcrypt.hash(password, salt);
//             let user = new User({ fullName, email, password:hashingPassword }); // Use "const" instead of "var"
//             await user.save();
//             res.json({success:true, user });
//         }
//     } catch (e) {
//         res.status(500).json({ error: e.message });
//     }
// });
authRoute.post('/api/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({ success: false, msg: "User with same email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashingPassword = await bcrypt.hash(password, salt);

    const user = new User({ fullName, email, password: hashingPassword });
    await user.save();

    // ✅ Create and return JWT token on signup too
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    const { password: _, ...userWithoutPassword } = user._doc;

    res.json({ success: true, token, user: userWithoutPassword });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

authRoute.post('/api/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email });

    if (!findUser) {
      return res.status(400).json({success:false, msg: "User not found with this email" });
    }

    const isMatch = await bcrypt.compare(password, findUser.password);
    if (!isMatch) {
      return res.status(400).json({success:false, msg: "Incorrect password" });
    }

    // Generate JWT Token (ADD THIS)
    const token = jwt.sign(
      { id: findUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    console.log(token);

    const { password: _, ...userWithoutPassword } = findUser._doc;

    res.json({ 
      success:true,
      token,
      user: userWithoutPassword 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

  //Define a Get route for the authentication router
  // authRoute.get('/',auth, async(req, res)=>{
  //   try {
  //     //Retrieve the user data from the database using the id from the authenticated user
  //     const user = await User.findById(req.user);
    
  //     //send the user data as json response, including all the document fields and the token
  //     res.json({...user._doc, token: req.token});
  //   } catch (e) {
  //     return res.status(500).json({error: e.message});
  //   }    
  // });
  authRoute.get('/', auth, async (req, res) => {
    try {
      // Directly use req.user (already fetched in middleware)
      res.json({ ...req.user._doc, token: req.token });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  authRoute.post('/tokenIsValid', async (req, res) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) return res.json(false);
      
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(verified.id);
      
      if (!user) return res.json(false);
      res.json(true);
    } catch (e) {
      res.json(false); // Return false on any error
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
        {$set:{state, city, locality}},
        {new:true,  runValidators: true},
      );
      //if no user is found return 404 page not found status with an error message
      if(!updatedUser){
        return res.status(404).json({error: "User not found"});
      }
      return res.status(200).json(updatedUser);
    } catch (e) {
      // Handle validation errors
        if (e.name === 'ValidationError') {
          return res.status(400).json({ error: e.message });
        }
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
  //Delete user Api
  authRoute.delete('/api/user/delete-account/:id',auth ,async(req, res)=>{
    try {
      const {id} = req.params;
      const user = await User.findById(id);

      if(!user){
        return res.status(404).json({msg:"User not found"});
      }
      //Delete the user based on their type
      if(user){
        await User.findByIdAndDelete(id);
      }
      return res.status(200).json({msg:"User deleted successfully"});
    } catch (e) {
      return res.status(500).json({error:e.message});
    }
  });
module.exports = authRoute;