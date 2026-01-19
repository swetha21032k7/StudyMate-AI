const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ==================== DATABASE CONNECTION ====================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/studymate', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.log('MongoDB connection error:', err);
});

// ==================== MODELS ====================
// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    subjects: [{
        id: Number,
        name: String,
        hours: Number,
        difficulty: String,
        examDate: String,
        color: String,
        progress: Number,
        sessionsCompleted: Number
    }],
    timetable: {
        type: Map,
        of: [{
            id: Number,
            subject: String,
            color: String,
            startTime: String,
            endTime: String,
            duration: Number,
            type: String,
            completed: Boolean
        }],
        default: {}
    },
    completedSessions: {
        type: Number,
        default: 0
    },
    streak: {
        type: Number,
        default: 0
    },
    preferences: {
        dailyHours: {
            type: Number,
            default: 4
        },
        sessionDuration: {
            type: Number,
            default: 45
        },
        breakDuration: {
            type: Number,
            default: 10
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

// Subject Schema
const subjectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    hours: {
        type: Number,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    examDate: String,
    color: String,
    progress: {
        type: Number,
        default: 0
    },
    sessionsCompleted: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Subject = mongoose.model('Subject', subjectSchema);

// Timetable Schema
const timetableSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dayOfWeek: {
        type: Number,
        required: true
    },
    sessions: [{
        id: Number,
        subject: String,
        color: String,
        startTime: String,
        endTime: String,
        duration: Number,
        type: String,
        completed: Boolean
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Timetable = mongoose.model('Timetable', timetableSchema);

// Study Stats Schema
const studyStatsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    sessionsCompleted: Number,
    totalMinutes: Number,
    subjectsStudied: [String]
});

const StudyStats = mongoose.model('StudyStats', studyStatsSchema);

// ==================== AUTHENTICATION ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key');

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key');

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ==================== MIDDLEWARE ====================

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// ==================== USER ROUTES ====================

// Get user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const { name, preferences } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            {
                name: name || undefined,
                preferences: preferences || undefined,
                updatedAt: Date.now()
            },
            { new: true }
        ).select('-password');

        res.json({ message: 'Profile updated', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ==================== SUBJECT ROUTES ====================

// Get all subjects for user
app.get('/api/subjects', authenticateToken, async (req, res) => {
    try {
        const subjects = await Subject.find({ userId: req.user.userId });
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add subject
app.post('/api/subjects', authenticateToken, async (req, res) => {
    try {
        const { name, hours, difficulty, examDate, color } = req.body;

        const subject = new Subject({
            userId: req.user.userId,
            name,
            hours,
            difficulty,
            examDate,
            color
        });

        await subject.save();
        res.status(201).json({ message: 'Subject added', subject });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update subject
app.put('/api/subjects/:id', authenticateToken, async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ message: 'Subject updated', subject });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete subject
app.delete('/api/subjects/:id', authenticateToken, async (req, res) => {
    try {
        await Subject.findByIdAndDelete(req.params.id);
        res.json({ message: 'Subject deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ==================== TIMETABLE ROUTES ====================

// Generate timetable
app.post('/api/timetable/generate', authenticateToken, async (req, res) => {
    try {
        const { preferences } = req.body;

        // Get user's subjects
        const subjects = await Subject.find({ userId: req.user.userId });

        if (subjects.length === 0) {
            return res.status(400).json({ message: 'No subjects found' });
        }

        // Generate timetable logic
        const timetable = generateTimetableLogic(subjects, preferences);

        // Save timetable
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        for (let day = 0; day < 7; day++) {
            await Timetable.findOneAndUpdate(
                { userId: req.user.userId, dayOfWeek: day },
                {
                    userId: req.user.userId,
                    dayOfWeek: day,
                    sessions: timetable[day]
                },
                { upsert: true, new: true }
            );
        }

        res.json({ message: 'Timetable generated', timetable });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get timetable
app.get('/api/timetable', authenticateToken, async (req, res) => {
    try {
        const timetables = await Timetable.find({ userId: req.user.userId });
        
        const timetable = {};
        timetables.forEach(t => {
            timetable[t.dayOfWeek] = t.sessions;
        });

        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update session completion status
app.put('/api/timetable/session/:dayOfWeek/:sessionId', authenticateToken, async (req, res) => {
    try {
        const { completed } = req.body;
        const { dayOfWeek, sessionId } = req.params;

        const timetable = await Timetable.findOne({
            userId: req.user.userId,
            dayOfWeek: parseInt(dayOfWeek)
        });

        if (timetable) {
            const session = timetable.sessions.find(s => s.id == sessionId);
            if (session) {
                session.completed = completed;
                await timetable.save();
            }
        }

        res.json({ message: 'Session updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ==================== STATISTICS ROUTES ====================

// Get study stats
app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const stats = await StudyStats.find({ userId: req.user.userId });
        const user = await User.findById(req.user.userId);

        res.json({
            completedSessions: user.completedSessions,
            streak: user.streak,
            stats: stats
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Record study session
app.post('/api/stats/session', authenticateToken, async (req, res) => {
    try {
        const { sessionsCompleted, totalMinutes, subjectsStudied } = req.body;

        const stats = new StudyStats({
            userId: req.user.userId,
            sessionsCompleted,
            totalMinutes,
            subjectsStudied
        });

        await stats.save();

        // Update user stats
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            {
                completedSessions: (user.completedSessions || 0) + sessionsCompleted
            },
            { new: true }
        );

        res.status(201).json({ message: 'Session recorded', stats });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ==================== EXPORT ROUTES ====================

// Export as JSON
app.get('/api/export/json', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        const subjects = await Subject.find({ userId: req.user.userId });
        const timetables = await Timetable.find({ userId: req.user.userId });

        const data = {
            user: {
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            },
            subjects,
            timetables,
            stats: {
                completedSessions: user.completedSessions,
                streak: user.streak
            },
            exportedAt: new Date().toISOString()
        };

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Export as CSV
app.get('/api/export/csv', authenticateToken, async (req, res) => {
    try {
        const timetables = await Timetable.find({ userId: req.user.userId });
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        let csv = 'Day,Time,Subject,Duration (mins),Type,Completed\n';

        timetables.forEach(t => {
            t.sessions.forEach(session => {
                csv += `${days[t.dayOfWeek]},"${session.startTime} - ${session.endTime}",${session.subject},${session.duration},${session.type},${session.completed ? 'Yes' : 'No'}\n`;
            });
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=timetable.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ==================== HELPER FUNCTIONS ====================

function generateTimetableLogic(subjects, preferences) {
    const dailyHours = preferences.dailyHours || 4;
    const sessionDuration = preferences.sessionDuration || 45;
    const breakDuration = preferences.breakDuration || 10;

    const timetable = {};

    const difficultyWeight = { easy: 1, medium: 1.5, hard: 2 };
    const weightedSubjects = subjects.map(s => ({
        ...s.toObject(),
        weight: s.hours * difficultyWeight[s.difficulty]
    }));

    weightedSubjects.sort((a, b) => {
        if (a.examDate && !b.examDate) return -1;
        if (!a.examDate && b.examDate) return 1;
        return b.weight - a.weight;
    });

    const dailyMinutes = dailyHours * 60;
    const sessionWithBreak = sessionDuration + breakDuration;
    const sessionsPerDay = Math.floor(dailyMinutes / sessionWithBreak);

    let subjectQueue = [];
    weightedSubjects.forEach(subject => {
        const sessionsNeeded = Math.ceil((subject.hours * 60) / sessionDuration);
        for (let i = 0; i < sessionsNeeded; i++) {
            subjectQueue.push(subject);
        }
    });

    subjectQueue = shuffleArray(subjectQueue);

    let queueIndex = 0;

    for (let day = 0; day < 7; day++) {
        timetable[day] = [];
        let currentTime = 9 * 60;

        for (let session = 0; session < sessionsPerDay && queueIndex < subjectQueue.length; session++) {
            const subject = subjectQueue[queueIndex];

            timetable[day].push({
                id: Date.now() + Math.random(),
                subject: subject.name,
                color: subject.color,
                startTime: formatTime(currentTime),
                endTime: formatTime(currentTime + sessionDuration),
                duration: sessionDuration,
                type: 'study',
                completed: false
            });

            currentTime += sessionDuration;

            if (session < sessionsPerDay - 1) {
                timetable[day].push({
                    id: Date.now() + Math.random(),
                    subject: 'Break',
                    color: 'bg-gray-400',
                    startTime: formatTime(currentTime),
                    endTime: formatTime(currentTime + breakDuration),
                    duration: breakDuration,
                    type: 'break',
                    completed: false
                });
                currentTime += breakDuration;
            }

            queueIndex++;
        }
    }

    return timetable;
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong', error: err.message });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});