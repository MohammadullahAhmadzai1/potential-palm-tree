const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: [String], required: true }, // Array of strings
    productQuantity: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    productId: { type: String, required: true },
    buyerId: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;