const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    model: {
        type: String,
        trim: true
    },
    licensePlate: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['Truck', 'Van', 'Car', 'Bike'],
        required: true
    },
    maxCapacity: {
        type: Number,
        required: true,
        min: 0
    },
    odometer: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['Available', 'On Trip', 'In Shop', 'Retired'],
        default: 'Available'
    },
    region: {
        type: String,
        trim: true
    },
    acquisitionCost: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
