// Description: This file contains all the routes for the members

// Importing the express module and creating a router, which is a mini express application for handling the routes
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Members = require('../models/member');

// Getting all the members
// router.get('/', async (req, res) => {

//     try {
//         const members = await Members.find();
//         res.json(members);
//     }
//     catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

// Getting a single member based on ID
router.get('/:id', async (req, res) => {

    try {
        const member = await Members.findById(req.params.id);
        res.json(member);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Updating a member
router.patch('/:id', async (req, res) => {

    try {
        const member = await Members.findById(req.params.id);
        if (req.body.name != null) {
            member.name = req.body.name;
        }
        if (req.body.email != null) {
            member.email = req.body.email;
        }
        if (req.body.password != null) {
            member.password = req.body.password;
        }
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Deleting a member
router.delete('/:id', async (req, res) => {

    try {
        const member = await Members.findById(req.params.id);
        await member.remove();
        res.json({ message: 'Member deleted' });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Exporting the router
module.exports = router;