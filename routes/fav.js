const express = require('express');
const favRoute = express.Router();
const Favourite = require('../models/fav');
const {auth} = require('../middleware/auth');
const mongoose = require('mongoose');

// Protected route
favRoute.post('/api/favourite', async (req, res) => {
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

        // Get buyerId from authenticated user
        // const buyerId = req.user._id;

        // Check for existing favorite
        const existingFav = await Favourite.findOne({ productId, buyerId });
        if (existingFav) {
            return res.status(409).json({ error: "Product already in favorites" });
        }

        const favourite = new Favourite({
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

        await favourite.save();
        
        // Return simplified response
        res.status(201).json({
            message: "Added to favorites",
            favorite: {
                id: favourite._id,
                productId: favourite.productId,
                productName: favourite.productName,
            productPrice:favourite.productPrice,
            category:favourite.category,
            image:favourite.image,
            productQuantity:favourite.productQuantity,
            quantity:favourite.quantity,
            buyerId:favourite.buyerId,
            description:favourite.description
            }
        });
        
    } catch (e) {
        console.log(e);
        // Better error handling
        if (e.name === 'ValidationError') {
            return res.status(400).json({ error: e.message });
        }
        res.status(500).json({ error: "Server error" });
    }
});
favRoute.get('/api/favourites/:buyerId', async (req, res) => {
    try {
        const favourites = await Favourite.find({ buyerId: req.params.buyerId });
        res.json(favourites);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// Delete specific favorite
favRoute.delete('/api/favourite/:id',auth, async (req, res) => {
    try {
        // 1. Verify authentication
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const buyerId = req.user._id;
        const favouriteId = req.params.id;

        // 2. Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(favouriteId)) {
            return res.status(400).json({ error: "Invalid favorite ID format" });
        }

        // 3. Find and delete with proper error handling
        const favourite = await Favourite.findOneAndDelete({
            _id: favouriteId,
            buyerId
        });

        if (!favourite) {
            return res.status(404).json({ 
                error: "Favorite not found or unauthorized access" 
            });
        }

        res.json({ 
            message: "Favorite removed successfully",
            deletedId: favouriteId
        });

    } catch (e) {
        console.error("Delete Error:", e);  // Detailed logging
        res.status(500).json({ 
            error: "Server error",
            details: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
});

module.exports = favRoute;