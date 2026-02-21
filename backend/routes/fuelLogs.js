const express = require('express');
const router = express.Router();
const FuelLog = require('../models/FuelLog');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// GET /api/fuel  (all roles)
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.vehicle) filter.vehicle = req.query.vehicle;
        if (req.query.trip) filter.trip = req.query.trip;

        const logs = await FuelLog.find(filter)
            .populate('vehicle', 'name licensePlate type')
            .populate('trip', 'origin destination status')
            .sort({ date: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/fuel/:id  (all roles)
router.get('/:id', async (req, res) => {
    try {
        const log = await FuelLog.findById(req.params.id)
            .populate('vehicle')
            .populate('trip');
        if (!log) return res.status(404).json({ message: 'Fuel log not found' });
        res.json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/fuel  (manager + financial_analyst)
router.post('/', authorize('manager', 'financial_analyst'), async (req, res) => {
    try {
        const log = new FuelLog(req.body);
        await log.save(); // pre-save hook auto-computes totalCost
        res.status(201).json(
            await log.populate([
                { path: 'vehicle', select: 'name licensePlate type' },
                { path: 'trip', select: 'origin destination status' }
            ])
        );
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /api/fuel/:id  (manager + financial_analyst)
router.put('/:id', authorize('manager', 'financial_analyst'), async (req, res) => {
    try {
        // Use findById + save to trigger pre-save hook for totalCost recalculation
        const log = await FuelLog.findById(req.params.id);
        if (!log) return res.status(404).json({ message: 'Fuel log not found' });

        Object.assign(log, req.body);
        await log.save();

        res.json(await log.populate([
            { path: 'vehicle', select: 'name licensePlate type' },
            { path: 'trip', select: 'origin destination status' }
        ]));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /api/fuel/:id  (manager + financial_analyst)
router.delete('/:id', authorize('manager', 'financial_analyst'), async (req, res) => {
    try {
        const log = await FuelLog.findByIdAndDelete(req.params.id);
        if (!log) return res.status(404).json({ message: 'Fuel log not found' });
        res.json({ message: 'Fuel log deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
