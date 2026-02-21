const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip'
    },
    liters: {
        type: Number,
        required: true,
        min: 0
    },
    costPerLiter: {
        type: Number,
        required: true,
        min: 0
    },
    totalCost: {
        type: Number
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    odometer: {
        type: Number,
        min: 0
    }
}, { timestamps: true });

// Auto-compute totalCost before saving (Mongoose 9: no next() needed)
fuelLogSchema.pre('save', function () {
    this.totalCost = parseFloat((this.liters * this.costPerLiter).toFixed(2));
});

module.exports = mongoose.model('FuelLog', fuelLogSchema);
