const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true,  // Corrected "require" to "required"
        trim: true,
    },
    email: {
        type: String,
        required: true,  // Corrected "require" to "required"
        trim: true, 
        validate: {
            validator: function(value) {
                const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return emailRegex.test(value);
            },
            message: 'Invalid email address',
        },
    },
    state: {
        type: String,
        default: " ",
    },
    city: {
        type: String,
        default: " ",
    },
    locality: {
        type: String,
        default: " ",
    },
    password: {
        type: String,
        required: true,  // Corrected "require" to "required"
        validate: {
            validator: function(value) {
                // Password must be at least 8 characters long
                return value.length >= 8;
            },
            message: "The password must be at least 8 characters long",
        },
    },
});

const User = mongoose.model('User', userSchema);

module.exports = mongoose.model('User', userSchema);
