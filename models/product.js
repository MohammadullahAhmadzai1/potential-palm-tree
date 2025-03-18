const mongoose = require('mongoose');

const productsSchema = mongoose.Schema({
  productName: {
    type: String,
    trim: true,
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  vendorId:{
    type:String,
    required: true
  },
  vendorFullName:{
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
      required: true,
    }
  ],
  popular: {
    type: Boolean,
    default: true,
  },
  recommend: {
    type: Boolean,
    default: true,
  },
  //add these fields for rating
  averageRating:{
    type: Number,
    default:0,
  },
  totalRatings:{
    type:Number,
    default:0,
  },
});

const Product = mongoose.model('Product', productsSchema);
module.exports = Product;
