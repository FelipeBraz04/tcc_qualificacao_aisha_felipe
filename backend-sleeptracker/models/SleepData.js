const mongoose = require('mongoose');

const sleepDataSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referencia o modelo User
        required: true,
    },
    sleepDate: {
        type: Date,
        required: true,
    },
    bedtime: {
        type: String, // Ex: "23:00"
        required: true,
    },
    wakeup: {
        type: String, // Ex: "07:00"
        required: true,
    },
    duration: {
        type: String, // Ex: "8h 0m"
        required: true,
    },
    quality: {
        type: Number, // 1 a 5
        required: true,
        min: 1,
        max: 5,
    },
    notes: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const SleepData = mongoose.model('SleepData', sleepDataSchema);

module.exports = SleepData;