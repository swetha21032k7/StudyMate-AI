const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    id: Number,
    subject: String,
    color: String,
    startTime: String,
    endTime: String,
    duration: Number,
    type: {
        type: String,
        enum: ['study', 'break']
    },
    completed: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const timetableSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dayOfWeek: {
        type: Number,
        required: true,
        min: 0,
        max: 6
    },
    sessions: [sessionSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
timetableSchema.index({ userId: 1, dayOfWeek: 1 });

// Pre-save middleware to update timestamps
timetableSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Timetable', timetableSchema);
