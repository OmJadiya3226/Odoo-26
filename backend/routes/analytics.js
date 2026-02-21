const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const MaintenanceLog = require('../models/MaintenanceLog');
const FuelLog = require('../models/FuelLog');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/analytics/dashboard — KPI overview
router.get('/dashboard', async (req, res) => {
    try {
        const { vehicleType, status } = req.query;

        // Base query for vehicles
        const vehicleQuery = {};
        if (vehicleType) vehicleQuery.type = vehicleType;
        if (status) vehicleQuery.status = status;

        // Specialized queries that build on the base vehicle query
        const activeQuery = { ...vehicleQuery, status: 'On Trip' };
        // If they filter by a status explicitly, only count if it matches
        if (status && status !== 'On Trip') activeQuery.status = '__NONE__';

        const shopQuery = { ...vehicleQuery, status: 'In Shop' };
        if (status && status !== 'In Shop') shopQuery.status = '__NONE__';

        const retiredQuery = { ...vehicleQuery, status: 'Retired' };
        if (status && status !== 'Retired') retiredQuery.status = '__NONE__';

        // Draft trips query
        // Pending cargo refers to Draft trips. If a vehicle filter is applied, we only count Draft trips for matching vehicles.
        // First we quickly get the IDs of the matching vehicles to filter the trips.
        const matchingVehicles = await Vehicle.find(vehicleQuery, '_id').lean();
        const matchingVehicleIds = matchingVehicles.map(v => v._id);

        const tripQuery = {
            status: { $in: ['Draft'] },
            vehicle: { $in: matchingVehicleIds }
        };

        const [
            totalVehicles,
            activeFleet,
            maintenanceAlerts,
            retiredVehicles,
            pendingCargo,
            totalDrivers,
            suspendedDrivers
        ] = await Promise.all([
            Vehicle.countDocuments(vehicleQuery),
            Vehicle.countDocuments(activeQuery),
            Vehicle.countDocuments(shopQuery),
            Vehicle.countDocuments(retiredQuery),
            Trip.countDocuments(tripQuery),
            Driver.countDocuments(),
            Driver.countDocuments({ status: 'Suspended' })
        ]);

        const assignedVehicles = activeFleet;
        const availableVehicles = totalVehicles - maintenanceAlerts - retiredVehicles;
        const utilizationRate = availableVehicles > 0
            ? Math.round((assignedVehicles / (availableVehicles + assignedVehicles)) * 100)
            : 0;

        res.json({
            activeFleet,
            maintenanceAlerts,
            utilizationRate,
            pendingCargo,
            totalVehicles,
            totalDrivers,
            suspendedDrivers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/analytics/vehicle-costs  — Total operational cost per vehicle
router.get('/vehicle-costs', async (req, res) => {
    try {
        const vehicles = await Vehicle.find().lean();

        const costs = await Promise.all(vehicles.map(async (v) => {
            const [fuelAgg, maintenanceAgg] = await Promise.all([
                FuelLog.aggregate([
                    { $match: { vehicle: v._id } },
                    { $group: { _id: null, total: { $sum: '$totalCost' }, liters: { $sum: '$liters' } } }
                ]),
                MaintenanceLog.aggregate([
                    { $match: { vehicle: v._id } },
                    { $group: { _id: null, total: { $sum: '$cost' } } }
                ])
            ]);

            const fuelCost = fuelAgg[0]?.total || 0;
            const totalLiters = fuelAgg[0]?.liters || 0;
            const maintenanceCost = maintenanceAgg[0]?.total || 0;
            const totalOperationalCost = fuelCost + maintenanceCost;

            // Total distance from completed trips
            const tripAgg = await Trip.aggregate([
                { $match: { vehicle: v._id, status: 'Completed' } },
                { $group: { _id: null, totalDist: { $sum: '$distance' }, totalRevenue: { $sum: '$revenue' } } }
            ]);
            const totalDistance = tripAgg[0]?.totalDist || 0;
            const totalRevenue = tripAgg[0]?.totalRevenue || 0;

            const fuelEfficiency = totalLiters > 0 ? parseFloat((totalDistance / totalLiters).toFixed(2)) : 0;
            const roi = v.acquisitionCost > 0
                ? parseFloat(((totalRevenue - totalOperationalCost) / v.acquisitionCost * 100).toFixed(2))
                : 0;

            return {
                vehicleId: v._id,
                name: v.name,
                licensePlate: v.licensePlate,
                type: v.type,
                status: v.status,
                acquisitionCost: v.acquisitionCost,
                fuelCost: parseFloat(fuelCost.toFixed(2)),
                maintenanceCost: parseFloat(maintenanceCost.toFixed(2)),
                totalOperationalCost: parseFloat(totalOperationalCost.toFixed(2)),
                totalDistance,
                totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                fuelEfficiency,
                roi
            };
        }));

        res.json(costs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/analytics/driver-stats — Driver performance summary
router.get('/driver-stats', async (req, res) => {
    try {
        const drivers = await Driver.find().lean();

        const stats = drivers.map(d => ({
            driverId: d._id,
            name: d.name,
            status: d.status,
            licenseExpiry: d.licenseExpiry,
            isLicenseExpired: new Date() > new Date(d.licenseExpiry),
            safetyScore: d.safetyScore,
            tripCount: d.tripCount,
            completedTrips: d.completedTrips,
            completionRate: d.tripCount > 0
                ? Math.round((d.completedTrips / d.tripCount) * 100)
                : 0
        }));

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
