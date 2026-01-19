# StudyMate AI - Smart Planning. Better Learning.

An AI-powered study planning assistant that generates personalized timetables based on user-provided subjects and preferences, with secure authentication and an interactive AI chat interface.

## Features

### 1. **User Authentication**
- ✅ Secure user registration and login
- ✅ Password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ Individual user profiles with data isolation
- ✅ Auto-logout functionality

### 2. **Subject Management**
- ✅ Add/delete subjects
- ✅ Set weekly study hours per subject
- ✅ Difficulty levels (Easy, Medium, Hard)
- ✅ Optional exam dates for priority scheduling
- ✅ Progress tracking per subject
- ✅ Color-coded subjects for easy identification

### 3. **Study Preferences**
- ✅ Customizable daily study hours (1-12 hours)
- ✅ Session duration options (15, 25, 45, 60, 90 minutes)
- ✅ Break duration options (5, 10, 15 minutes)
- ✅ Preferences saved per user

### 4. **AI Timetable Generator**
- ✅ Smart algorithm prioritizing harder subjects
- ✅ Subjects with exam dates get higher priority
- ✅ Balanced distribution across all 7 days
- ✅ Automatic break scheduling
- ✅ Regenerate timetable on demand
- ✅ Session completion tracking

### 5. **Pomodoro Timer**
- ✅ Configurable study/break intervals
- ✅ Audio notifications on timer completion
- ✅ Session counter for daily tracking
- ✅ Multiple duration options
- ✅ Pause/Resume functionality

### 6. **AI Chat Assistant**
- ✅ Context-aware responses
- ✅ Explains generated timetable
- ✅ Subject-specific guidance
- ✅ Study tips and productivity advice
- ✅ Motivational messages
- ✅ Quick action buttons for common queries
- ✅ Real-time typing indicators

### 7. **Data Export & Visualization**
- ✅ Export as CSV
- ✅ Export as PDF
- ✅ Export as JSON
- ✅ Print functionality
- ✅ Weekly overview charts
- ✅ Progress tracking visualization

### 8. **Dashboard & Analytics**
- ✅ Quick statistics (Subjects, Hours/Day, Sessions, Streak)
- ✅ Subject progress bars
- ✅ Weekly study distribution chart
- ✅ Study statistics and trends
- ✅ Real-time UI updates

## Tech Stack

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with Tailwind CSS
- **JavaScript** - Interactivity
- **Local Storage** - Client-side data persistence
- **Font Awesome** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **bcryptjs** - Password hashing
- **jsonwebtoken (JWT)** - Authentication
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/studymate-ai.git
cd studymate-ai
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/studymate
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

### Step 4: Start MongoDB
```bash
# If MongoDB is installed locally
mongod

# Or use MongoDB Atlas by updating MONGODB_URI in .env
```

### Step 5: Run the Server
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

### Step 6: Access the Frontend
Open your browser and navigate to:
```
http://localhost:5000
```

## Project Structure

```
studymate-ai/
├── index.html                 # Frontend application
├── server.js                 # Main backend server
├── package.json              # Dependencies
├── .env                      # Environment variables
├── .env.example              # Example environment file
├── models/
│   ├── User.js              # User schema and model
│   ├── Subject.js           # Subject schema and model
│   ├── Timetable.js         # Timetable schema and model
│   └── StudyStats.js        # Study statistics schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User routes
│   ├── subjects.js          # Subject routes
│   ├── timetable.js         # Timetable routes
│   └── stats.js             # Statistics routes
├── middleware/
│   └── auth.js              # Authentication middleware
├── config/
│   └── database.js          # Database configuration
└── README.md               # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Add new subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Timetable
- `POST /api/timetable/generate` - Generate timetable
- `GET /api/timetable` - Get timetable
- `PUT /api/timetable/session/:dayOfWeek/:sessionId` - Update session

### Statistics
- `GET /api/stats` - Get study statistics
- `POST /api/stats/session` - Record study session

### Export
- `GET /api/export/json` - Export as JSON
- `GET /api/export/csv` - Export as CSV

## Usage Guide

### Adding Subjects
1. Log in or create an account
2. Click "Add Subject"
3. Enter subject name, weekly hours, and difficulty level
4. Optionally add an exam date
5. Click "Add Subject"

### Generating Timetable
1. Add at least one subject
2. Adjust preferences (daily hours, session duration, break duration)
3. Click "Generate AI Timetable"
4. View the generated schedule by selecting different days

### Using the Pomodoro Timer
1. Click the timer icon in the header
2. Select desired duration or use default
3. Click "Start" to begin
4. Timer will alternate between study and break sessions
5. Audio notification plays when timer ends

### Tracking Progress
1. Click on a study session to mark it as completed
2. Progress bars update automatically
3. View weekly overview chart to see study distribution
4. Check quick stats in the dashboard

### AI Chat Assistance
1. Click the chat icon in the header
2. Ask questions about your schedule or study tips
3. Use quick action buttons for common queries
4. AI provides context-aware responses

### Exporting Data
1. Click the export/download icon in the header
2. Choose export format (CSV, PDF, JSON, or Print)
3. Save or print the file

## Features in Detail

### AI Timetable Algorithm
The AI timetable generation algorithm considers:
- **Subject Difficulty**: Harder subjects get more priority and better time slots
- **Weekly Hours**: Distributes weekly study hours across all 7 days
- **Exam Dates**: Subjects with near exam dates get prioritized
- **Preferences**: Respects user's daily study hours and session preferences
- **Variety**: Shuffles subjects to maintain learning interest

### Smart Scheduling
- Peak hours (9 AM - 5 PM) are optimized for harder subjects
- Balanced workload distribution across all days
- Regular breaks to prevent burnout
- Easy subjects scheduled between harder ones for mental breaks

### Progress Tracking
- Visual progress bars for each subject
- Session completion marking
- Weekly study minutes tracking
- Daily streak counter
- Historical data for analysis

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ CORS protection
- ✅ Input validation
- ✅ Error handling
- ✅ Secure data isolation per user

