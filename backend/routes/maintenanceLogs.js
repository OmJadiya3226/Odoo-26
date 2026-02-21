const express = require('express');
const router = express.Router();
const MaintenanceLog = require('../models/MaintenanceLog');
const Vehicle = require('../models/Vehicle');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// GET /api/maintenance  (all roles)
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.vehicle) filter.vehicle = req.query.vehicle;

        const logs = await MaintenanceLog.find(filter)
            .populate('vehicle', 'name licensePlate type status')
            .sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/maintenance/:id  (all roles)
router.get('/:id', async (req, res) => {
    try {
        const log = await MaintenanceLog.findById(req.params.id).populate('vehicle');
        if (!log) return res.status(404).json({ message: 'Maintenance log not found' });
        res.json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/maintenance  — AUTO-SETS vehicle status to "In Shop" (manager only)
router.post('/', authorize('manager'), async (req, res) => {
    try {
        const log = await MaintenanceLog.create(req.body);

        // Auto-logic: set vehicle to "In Shop"
        await Vehicle.findByIdAndUpdate(req.body.vehicle, { status: 'In Shop' });

        res.status(201).json(await log.populate('vehicle', 'name licensePlate type status'));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /api/maintenance/:id  (manager only)
router.put('/:id', authorize('manager'), async (req, res) => {
    try {
        const log = await MaintenanceLog.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('vehicle', 'name licensePlate type status');
        if (!log) return res.status(404).json({ message: 'Maintenance log not found' });
        res.json(log);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PATCH /api/maintenance/:id/resolve — Mark as resolved (manager only)
router.patch('/:id/resolve', authorize('manager'), async (req, res) => {
    try {
        const log = await MaintenanceLog.findById(req.params.id);
        if (!log) return res.status(404).json({ message: 'Maintenance log not found' });

        log.isResolved = true;
        await log.save();

        // Check if there are other unresolved logs for this vehicle
        const openLogs = await MaintenanceLog.countDocuments({
            vehicle: log.vehicle,
            isResolved: false
        });

        // If no more open logs, reset vehicle to Available
        if (openLogs === 0) {
            await Vehicle.findByIdAndUpdate(log.vehicle, { status: 'Available' });
        }

        res.json(await log.populate('vehicle', 'name licensePlate status'));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/maintenance/:id  (manager only)
router.delete('/:id', authorize('manager'), async (req, res) => {
    try {
        const log = await MaintenanceLog.findByIdAndDelete(req.params.id);
        if (!log) return res.status(404).json({ message: 'Maintenance log not found' });

        // Check remaining open logs for this vehicle
        const openLogs = await MaintenanceLog.countDocuments({
            vehicle: log.vehicle,
            isResolved: false
        });

        if (openLogs === 0) {
            // Safe to reset vehicle to Available
            const vehicle = await Vehicle.findById(log.vehicle);
            if (vehicle && vehicle.status === 'In Shop') {
                vehicle.status = 'Available';
                await vehicle.save();
            }
        }

        res.json({ message: 'Maintenance log deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
