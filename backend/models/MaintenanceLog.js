const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    serviceType: {
        type: String,
        required: true,
        enum: ['Oil Change', 'Tire Replacement', 'Brake Service', 'Engine Repair', 'Electrical', 'Body Work', 'Inspection', 'Other'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    cost: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    odometer: {
        type: Number,
        min: 0
    },
    technicianName: {
        type: String,
        trim: true
    },
    isResolved: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceLog', maintenanceLogSchema);
