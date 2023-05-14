// Description: This file contains the schema for the members collection in the database

// Importing the mongoose module
const { Binary } = require('mongodb');
const mongoose = require('mongoose');

// Creating the schema
const memberSchema = new mongoose.Schema( {

    name: {
        type: String,
        required: true 
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        default: true
    },
    subscription: {
        type: Boolean
    },
    photo: {
        type: Buffer,
        required: true
    }
});

// Exporting the schema
module.exports = mongoose.model('Member', memberSchema);