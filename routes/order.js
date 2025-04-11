const express = require('express');
const orderRouter = express.Router();
const Order = require('../models/order');
const stripe = require('stripe')("sk_test_51R4WP1Ldmwgam28mVVRjE4hNgEbHNsJrHL3p8PS5wvpFjIfjHyWyXlo1f29vepCsmPudFL60ZVtBc8xtE6988IJX00GxpMspG0");
const {auth, vendorAuth} = require('../middleware/auth');
orderRouter.post('/orders',auth,vendorAuth, async (req, res) => {
    try {
        const {
            fullName, email, state, city, locality, productName,
            productPrice, productId, quantity, category, image,
            buyerId, vendorId, paymentStatus, paymentIntentId, paymentMethod
        } = req.body;

        const createdAt = new Date();
        const order = new Order({
            fullName, email, state, city, locality, productName,
            productPrice, productId, quantity, category, image,
            buyerId, vendorId, paymentStatus, paymentIntentId, paymentMethod, createdAt
        });

        await order.save();

        // Fetch the saved order to ensure `productId` is present
        const savedOrder = await Order.findById(order._id);

        return res.status(201).json(savedOrder); // Send the saved order
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

//payment api 
orderRouter.post('/payment-intent',auth, async (req,res)=>{
    try {
        const {amount, currency} = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
           amount,
           currency, 
        });
        return res.status(200).json(paymentIntent);
    } catch (e) { 
        return res.status(500).json({error: e.message});
    }
});

orderRouter.get('/payment-intent/:id',auth, async(req,res)=>{
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(req.params.id);
        return res.status(200).json(paymentIntent);
    } catch (e) {
        return res.status(500).json({error:e.message});
    }
});

orderRouter.get('/orders/:buyerId',auth, async (req, res) => {
    try {
      const { buyerId } = req.params;
      const orders = await Order.find({ buyerId });

      if (orders.length === 0) {
        return res.status(404).json({ msg: "No Orders found for this buyer" });
      }
  
      return res.status(200).json(orders);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

orderRouter.delete('/orders/:id', async(req, res)=>{
    try {
      const {id} = req.params;
      //find and delete order from the database using the extracted id
      const deletedOrder = await Order.findByIdAndDelete(id); 
        //check if an order was found and deleted
        if(!deletedOrder){
            return res.status(404).json({msg:"Order not found"});
        }else{
            return res.status(200).json({msg:"Order was deleted successfully"});
        }
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});
orderRouter.get('/orders/vendors/:vendorId', vendorAuth, async (req, res)=>{
    try {
        //Extract the vendorId from the request parameter
        const { vendorId } = req.params;

    // Verify URL param matches authenticated vendor's ID
    if (vendorId !== req.vendor._id.toString()) {
      return res.status(403).json({ msg: "Unauthorized access" });
    }
        //find all the orders in the database that match the buyerdid
        const orders = await Order.find({vendorId});
        if(orders.length == 0){
            return res.status(404).json({msg:"No Orders found for this vendor"});
        }
        return res.status(200).json(orders);

    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

orderRouter.patch('/orders/:id/delivered', async(req, res)=>{
    try {
        const {id} = req.params;
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            {delivered: true, processing:false},
             {new: true}
            );
        if(!updatedOrder){
            return res.status(404).json({msg: "Order not found"});
        }else{
            return res.status(200).json(updatedOrder);
        }
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});
orderRouter.patch('/orders/:id/processing', async(req, res)=>{
    try {
        const {id} = req.params;
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            {processing: false, delivered:false},
             {new: true}
            );
        if(!updatedOrder){
            return res.status(404).json({msg: "Order not found"});
        }else{
            return res.status(200).json(updatedOrder);
        }
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});
orderRouter.get('/orders', async(req, res)=>{
    try{
        const orders =  await Order.find();
        return res.status(200).json(orders);
    }catch(e){
        res.status(500).json({error: e.message});
    }

});
module.exports = orderRouter;