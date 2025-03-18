const express = require('express');
const ProductReview = require('../models/product_review');
const productReviewRoute = express.Router();
const Product = require('../models/product');
productReviewRoute.post('/api/product-review', async (req, res)=>{
    try {
        const {buyerId, email, fullName, productId, rating, review} = req.body;
        //if the user has already reveiwed the product
        const existingReview = await ProductReview.findOne({buyerId, productId});
        if(existingReview){
            return res.status(400).json({msg:"You have already reviewed this product"});
        }
        const productReview = new ProductReview({buyerId, email, fullName, productId, rating, review});
        await productReview.save();

        //find the product associated with the review using product id
        const product = await Product.findById(productId);
        //if the procduct was not found return a 404 error response
        if(!product){
            return res.status(404).json({msg: "Product not found"});
        }
        product.totalRatings+=1;
        product.averageRating = ((product.averageRating * (product.totalRatings - 1)) + rating)/product.totalRatings;
        //save the updated product back to database
        await product.save();
        
        return res.status(201).send(productReview);
    } catch (e) {
        res.status(500).json({error: e.message});
    }  
});
productReviewRoute.get('/api/reviews', async (req,res)=>{
    try {
        const reviews = await ProductReview.find();
        return res.status(200).json(reviews);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
    

})
module.exports = productReviewRoute;