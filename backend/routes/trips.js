const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// GET /api/trips  (all roles)
router.get('/', async (req, res) => {
    try {
        const trips = await Trip.find()
            .populate('vehicle', 'name licensePlate type maxCapacity status')
            .populate('driver', 'name licenseNumber status licenseExpiry')
            .sort({ createdAt: -1 });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/trips/:id  (all roles)
router.get('/:id', async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id)
            .populate('vehicle')
            .populate('driver');
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        res.json(trip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/trips  — create with full validation (manager + dispatcher)
router.post('/', authorize('manager', 'dispatcher'), async (req, res) => {
    try {
        const { vehicle: vehicleId, driver: driverId, cargoWeight, origin, destination, startOdometer, revenue, notes } = req.body;

        // 1. Check vehicle exists and is Available
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        if (vehicle.status !== 'Available') {
            return res.status(400).json({ message: `Vehicle is not available (status: ${vehicle.status})` });
        }

        // 2. Cargo weight validation
        if (cargoWeight > vehicle.maxCapacity) {
            return res.status(400).json({
                message: `Cargo weight (${cargoWeight} kg) exceeds vehicle max capacity (${vehicle.maxCapacity} kg)`
            });
        }

        // 3. Check driver exists and is not Suspended
        const driver = await Driver.findById(driverId);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        if (driver.status === 'Suspended') {
            return res.status(400).json({ message: 'Driver is suspended and cannot be assigned' });
        }

        // 4. License expiry check
        if (new Date() > new Date(driver.licenseExpiry)) {
            return res.status(400).json({ message: `Driver's license has expired on ${new Date(driver.licenseExpiry).toLocaleDateString()}` });
        }

        // 5. Driver must not already be On Duty (on a trip)
        if (driver.status === 'On Duty') {
            return res.status(400).json({ message: 'Driver is already On Duty on another trip' });
        }

        // All checks passed — create the trip as a Draft (Pending Cargo)
        const trip = await Trip.create({
            vehicle: vehicleId,
            driver: driverId,
            cargoWeight,
            origin,
            destination,
            startOdometer: startOdometer || vehicle.odometer,
            revenue: revenue || 0,
            notes,
            status: 'Draft'
        });

        // We DO NOT update the vehicle to 'On Trip' or Driver to 'On Duty' yet.
        // That happens when the trip is explicitly Dispatched.

        res.status(201).json(await trip.populate(['vehicle', 'driver']));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PATCH /api/trips/:id/dispatch  — Draft → Dispatched (manager + dispatcher)
router.patch('/:id/dispatch', authorize('manager', 'dispatcher'), async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        if (trip.status !== 'Draft') {
            return res.status(400).json({ message: `Only Draft trips can be dispatched (current: ${trip.status})` });
        }

        // Update vehicle and driver status
        await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'On Trip' });
        await Driver.findByIdAndUpdate(trip.driver, {
            status: 'On Duty',
            $inc: { tripCount: 1 }
        });

        trip.status = 'Dispatched';
        await trip.save();

        res.json(await trip.populate(['vehicle', 'driver']));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH /api/trips/:id/complete  — Dispatched → Completed (manager + dispatcher)
router.patch('/:id/complete', authorize('manager', 'dispatcher'), async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        if (trip.status !== 'Dispatched') {
            return res.status(400).json({ message: `Only Dispatched trips can be completed (current: ${trip.status})` });
        }

        const { endOdometer, revenue } = req.body;

        // Calculate distance
        const distance = endOdometer ? Math.max(0, endOdometer - trip.startOdometer) : 0;

        // Update vehicle odometer + status
        const vehicle = await Vehicle.findById(trip.vehicle);
        if (vehicle) {
            vehicle.status = 'Available';
            if (endOdometer) vehicle.odometer = endOdometer;
            await vehicle.save();
        }

        // Update driver stats + status
        const driver = await Driver.findById(trip.driver);
        if (driver) {
            driver.status = 'Off Duty';
            driver.tripCount += 1;
            driver.completedTrips += 1;
            await driver.save();
        }

        trip.status = 'Completed';
        trip.endOdometer = endOdometer || trip.startOdometer;
        trip.distance = distance;
        if (revenue !== undefined) trip.revenue = revenue;
        await trip.save();

        res.json(await trip.populate(['vehicle', 'driver']));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH /api/trips/:id/cancel  — Cancel trip (manager + dispatcher)
router.patch('/:id/cancel', authorize('manager', 'dispatcher'), async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        if (['Completed', 'Cancelled'].includes(trip.status)) {
            return res.status(400).json({ message: `Cannot cancel a ${trip.status} trip` });
        }

        // Only reset vehicle/driver if already dispatched
        if (trip.status === 'Dispatched') {
            await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'Available' });
            const driver = await Driver.findById(trip.driver);
            if (driver) {
                driver.status = 'Off Duty';
                driver.tripCount += 1;
                await driver.save();
            }
        }

        trip.status = 'Cancelled';
        await trip.save();

        res.json(await trip.populate(['vehicle', 'driver']));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/trips/:id  (manager + dispatcher — only Draft or Cancelled)
router.delete('/:id', authorize('manager', 'dispatcher'), async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        if (!['Draft', 'Cancelled'].includes(trip.status)) {
            return res.status(400).json({ message: 'Only Draft or Cancelled trips can be deleted' });
        }
        await trip.deleteOne();
        res.json({ message: 'Trip deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
