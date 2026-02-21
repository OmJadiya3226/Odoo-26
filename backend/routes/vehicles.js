const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// GET /api/vehicles  — supports ?type=&status=&region=  (all roles)
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.type) filter.type = req.query.type;
        if (req.query.status) filter.status = req.query.status;
        if (req.query.region) filter.region = req.query.region;

        const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/vehicles/:id  (all roles)
router.get('/:id', async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/vehicles  (manager only)
router.post('/', authorize('manager'), async (req, res) => {
    try {
        const vehicle = await Vehicle.create(req.body);
        res.status(201).json(vehicle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /api/vehicles/:id  (manager only)
router.put('/:id', authorize('manager'), async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        res.json(vehicle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /api/vehicles/:id  (manager only)
router.delete('/:id', authorize('manager'), async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        res.json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH /api/vehicles/:id/retire  — toggle Retired status (manager only)
router.patch('/:id/retire', authorize('manager'), async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

        vehicle.status = vehicle.status === 'Retired' ? 'Available' : 'Retired';
        await vehicle.save();
        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
