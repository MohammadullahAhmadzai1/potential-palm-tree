const express = require('express');
const mongoose = require('mongoose');
const authRoute = require('./routes/auth'); // Adjust path accordingly
const bannerRoute = require('./routes/banner');
const categoryRouter = require('./routes/category');
const subCategoryRouter = require('./routes/sub_category');
const productsRouter = require('./routes/product');
const productReviewRouter = require('./routes/product_review');
const vendorRouter = require('./routes/vendor'); 
const orderRouter = require('./routes/order');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

const DB = "mongodb+srv://mohammadullah:lktg1342@cluster0.z8q8v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());//Enabe Cors for all routes and origin (domain)

app.use('/api',orderRouter); 
app.use(bannerRoute);
app.use(categoryRouter);
app.use(subCategoryRouter);
app.use(productsRouter);
app.use(productReviewRouter);
app.use(vendorRouter);


// Connect to MongoDB
mongoose.connect(DB)
  .then(() => {
    console.log('MongoDB connected');
    // Start the server AFTER successful connection
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });

// Define routes
app.use(authRoute); // <-- Routes are defined here

// Error-handling middleware (MUST come after all other routes/middleware)
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message }); // Always return JSON
});

