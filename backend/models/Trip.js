const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    origin: {
        type: String,
        required: true,
        trim: true
    },
    destination: {
        type: String,
        required: true,
        trim: true
    },
    cargoWeight: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
        default: 'Draft'
    },
    startOdometer: {
        type: Number,
        default: 0
    },
    endOdometer: {
        type: Number
    },
    distance: {
        type: Number,
        default: 0
    },
    revenue: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
