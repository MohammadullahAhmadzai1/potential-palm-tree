const express = require('express');
const favRoute = express.Router();
const Favourite = require('../models/fav');

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
favRoute.delete('/api/favourite/:id', async (req, res) => {
    try {
        const buyerId = req.user._id;
        const favouriteId = req.params.id;

        const favourite = await Favourite.findOne({
            _id: favouriteId,
            buyerId
        });

        if (!favourite) {
            return res.status(404).json({ error: "Favorite not found" });
        }

        await Favourite.deleteOne({ _id: favouriteId });
        
        res.json({ 
            message: "Favorite removed successfully",
            deletedId: favouriteId
        });

    } catch (e) {
        if (e.name === 'CastError') {
            return res.status(400).json({ error: "Invalid favorite ID" });
        }
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = favRoute;