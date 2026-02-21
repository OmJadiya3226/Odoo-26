var express = require('express');
var router = express.Router();
const User = require('../models/user');

// GET all users from MongoDB
router.get('/users', async function (req, res) {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single user by ID
router.get('/users/:id', async function (req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create new user
router.post('/users', async function (req, res) {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        age: req.body.age
    });

    try {
        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update user
router.put('/users/:id', async function (req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.body.name) user.name = req.body.name;
        if (req.body.email) user.email = req.body.email;
        if (req.body.age) user.age = req.body.age;

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE user
router.delete('/users/:id', async function (req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Test route
router.get('/test', function (req, res) {
    res.json({
        message: 'Hello from Backend!',
        timestamp: new Date(),
        database: 'MongoDB Atlas Connected'
    });
});

module.exports = router;