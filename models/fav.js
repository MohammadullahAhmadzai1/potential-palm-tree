const mongoose = require('mongoose');
const favSchema = mongoose.Schema({
    productName:{
        type: String,
        required: true,
    },
    productPrice:{
        type: Number,
        required: true,
    },
    category:{
        type: String,
        required: true,
    },
    image:{
        type: [String],
        required: true,
    },
    productQuantity:{
        type: Number,
        required:true,
    },
    quantity:{
        type: Number,
        required:true,
    },
    productId:{
        type:String,
        required:true,
    },
    buyerId:{
        type:String,
        required:true,
    },
    description:{
        type: String,
        required: true,
    }
});
const Favourite = mongoose.model("Favourite", favSchema);
module.exports = Favourite;