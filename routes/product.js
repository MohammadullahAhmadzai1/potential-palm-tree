const express = require('express');
const Product = require('../models/product');
const productsRoute = express.Router();
const { auth, vendorAuth } = require('../middleware/auth'); // Path is correct
// Create product (with vendor auth)
productsRoute.post('/api/products',auth, vendorAuth, async (req, res) => {
  try {
    const { productName, productPrice, quantity, description, category, subCategory, images } = req.body;
    
    // Get vendor details from middleware
    const vendorId = req.user._id;
    const vendorFullName = req.user.fullName;

    const product = new Product({
      productName,
      productPrice,
      quantity,
      description,
      category,
      vendorId,
      vendorFullName,
      subCategory,
      images
    });

    await product.save();
    res.status(201).send(product);
  } catch (e) {
    if (e.name === 'ValidationError') {
      return res.status(400).json({ error: e.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Popular products
productsRoute.get('/api/popular-products', async (req, res) => {
  try {
    const products = await Product.find({ popular: true });
    if (!products.length) {
      return res.status(404).json({ msg: "No popular products found" });
    }
    res.status(200).json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Recommended products
productsRoute.get('/api/recommended-products', async (req, res) => {
  try {
    const products = await Product.find({ popular: true });
    if (!products.length) {
      return res.status(404).json({ msg: "No recommended products found" });
    }
    res.status(200).json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Products by category
productsRoute.get('/api/product-by-category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category, popular: true }).lean();
    if (!products.length) {
      return res.status(404).json({ msg: "No products found in this category" });
    }
    res.status(200).json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Related products by subcategory (FIXED TYPO)
productsRoute.get('/api/related-products-by-subcategory/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    const relatedProducts = await Product.find({
      subCategory: product.subCategory,
      _id: { $ne: productId }
    });
    if (!relatedProducts.length) {
      return res.status(404).json({ msg: "No related products found" });
    }
    res.status(200).json(relatedProducts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Top-rated products
productsRoute.get('/api/top-rated-products', async (req, res) => {
  try {
    const topRatedProducts = await Product.find({ averageRating: { $exists: true } })
      .sort({ averageRating: -1 })
      .limit(10);
    if (!topRatedProducts.length) {
      return res.status(404).json({ msg: "No top-rated products found" });
    }
    res.status(200).json(topRatedProducts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productsRoute.get('/api/products-by-subcategory/:subCategory', async(req, res)=>{
  try {
    const {subCategory} = req.params;
    const products = await Product.find({subCategory:subCategory});
    if(!products || products.length==0){
      return res.status(404).json({msg:"No Products found in this subCategory"});
    }
    return res.status(200).json(products);
  } catch (e) {
    res.status(500).json({error: e.message});
  }
});

//Route for searching products by name or description
productsRoute.get('/api/search-products', async(req, res)=>{
  try {
    //Extract the query parameter from the request query String
    const {query} = req.query;
    //Validate that query parameter is provided
    //if missing, return 400 status with an error message
    if(!query){
      return res.status(400).json({msg:"Query parameter required"});
    }
    //search for the products collection for documents where either "productName" or "description"
    //contains the specified query String
    const products = await Product.find({
      $or:[
        //Regex will match any productName containing the query String,
        //For example, if the user search for 'apple' the reqex will check if 'apple' is part of any
        //productName, so products name "Green Apple ", or "Fresh Apples", would all match because they contain the word 'apple'
        {productName: {$regex:query, $options:'i'}},
        {description: {$regex:query, $options:'i'}},
      ]
    });

    //check if any products were found, if no product match the query return 404
    if(!products || products.length==0){
      return res.status(404).json({msg:"No products fount matching the query"});
    }
    return res.status(200).json(products);

  } catch (e) {
    res.status(500).json({error:e.message});
  }
});

module.exports = productsRoute;