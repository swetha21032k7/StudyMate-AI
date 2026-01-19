const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide a subject name'],
        trim: true
    },
    hours: {
        type: Number,
        required: [true, 'Please provide weekly hours'],
        min: 1,
        max: 20
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: [true, 'Please provide difficulty level'],
        default: 'medium'
    },
    examDate: {
        type: Date
    },
    color: {
        type: String,
        default: '#667eea'
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    sessionsCompleted: {
        type: Number,
        default: 0
    },
    notes: String,
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
subjectSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Subject', subjectSchema);
