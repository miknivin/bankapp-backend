// db.js

const mongoose = require('mongoose');

// Connect to MongoDB and listen for 'connected' event
mongoose.connect('mongodb://127.0.0.1:27017/Register_data')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
    });

const User = mongoose.model('User', {
    username: String,
    acno: Number,
    password: String,
    balance: Number,
    transactions: []
});

module.exports = {
    User
};
