const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    licenseExpiry: {
        type: Date,
        required: true
    },
    licenseCategory: {
        type: String,
        enum: ['Truck', 'Van', 'Car', 'Bike'],
        required: true
    },
    status: {
        type: String,
        enum: ['On Duty', 'Off Duty', 'Suspended'],
        default: 'Off Duty'
    },
    safetyScore: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
    },
    tripCount: {
        type: Number,
        default: 0
    },
    completedTrips: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Virtual: is license expired?
driverSchema.virtual('isLicenseExpired').get(function () {
    return new Date() > this.licenseExpiry;
});

driverSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Driver', driverSchema);
