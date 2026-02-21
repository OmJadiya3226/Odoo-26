const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// GET /api/drivers  (all roles)
router.get('/', async (req, res) => {
    try {
        const drivers = await Driver.find().sort({ createdAt: -1 });
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/drivers/:id  (all roles)
router.get('/:id', async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        res.json(driver);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/drivers  (manager only)
router.post('/', authorize('manager'), async (req, res) => {
    try {
        const driver = await Driver.create(req.body);
        res.status(201).json(driver);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /api/drivers/:id  (manager + safety_officer can update profile)
router.put('/:id', authorize('manager', 'safety_officer'), async (req, res) => {
    try {
        const driver = await Driver.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        res.json(driver);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /api/drivers/:id  (manager only)
router.delete('/:id', authorize('manager'), async (req, res) => {
    try {
        const driver = await Driver.findByIdAndDelete(req.params.id);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        res.json({ message: 'Driver deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH /api/drivers/:id/status  (manager + safety_officer)
router.patch('/:id/status', authorize('manager', 'safety_officer'), async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ['On Duty', 'Off Duty', 'Suspended'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        const driver = await Driver.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        res.json(driver);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
