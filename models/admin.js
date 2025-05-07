const mongoose = require('mongoose');

const adminSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true, 
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true, 
        validate: {
            validator: function(value) {
                const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return emailRegex.test(value);
            },
            message: 'Invalid email address',
        },
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function(value) {
                // Password must be at least 8 characters long
                return value.length >= 8;
            },
            message: "The password must be at least 8 characters long",
        },
    },
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = mongoose.model('Admin', adminSchema);
