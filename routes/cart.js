const express = require('express');
const cartRoute = express.Router();
const Cart = require('../models/cart');
const mongoose = require('mongoose');
// Add to Cart
cartRoute.post('/api/cart', async (req, res) => {
    try {
        const { 
            productName,
            productPrice,
            category,
            image,
            productQuantity,
            quantity,
            productId,
            buyerId,
            description
        } = req.body;

        // Check if item already exists in cart
        const existingCartItem = await Cart.findOne({ productId, buyerId });

        if(existingCartItem) {
            existingCartItem.quantity += quantity;
            await existingCartItem.save();
            return res.status(200).json(existingCartItem);
        }

        const newCartItem = new Cart({
            productName,
            productPrice,
            category,
            image,
            productQuantity,
            quantity,
            productId,
            buyerId,
            description
        });

        await newCartItem.save();
        res.status(201).json(newCartItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Cart Items
// Get cart by buyerId
cartRoute.get('/api/cart/:buyerId', async (req, res) => {
    try {
        const cartItems = await Cart.find({ buyerId: req.params.buyerId });
        res.json(cartItems);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// // Add to cart (existing with buyerId)
// cartRoute.post('/api/cart', async (req, res) => { /* existing */ });

// Update Cart Item Quantity
cartRoute.put('/api/cart/:id', async (req, res) => {
    try {
        const { quantity } = req.body;
        const updatedItem = await Cart.findByIdAndUpdate(
            req.params.id,
            { quantity },
            { new: true }
        );
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove from Cart
cartRoute.delete('/api/cart/:id', async (req, res) => {
    try {
        // Verify valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid cart item ID" });
        }

        const deletedItem = await Cart.findByIdAndDelete(req.params.id);
        
        if (!deletedItem) {
            return res.status(404).json({ error: "Cart item not found" });
        }

        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Add to cartRoute.js
cartRoute.delete('/api/cart/clear/:buyerId', async (req, res) => {
    try {
      await Cart.deleteMany({ buyerId: req.params.buyerId });
      res.json({ message: 'Cart cleared successfully' });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

module.exports = cartRoute;