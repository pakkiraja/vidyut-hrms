const express = require('express');
const dotenv = require('dotenv');
const { connectDB, sequelize } = require('./config/db');
require('./models'); // Import all models to define associations

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/designations', require('./routes/designationRoutes'));
app.use('/api/shifts', require('./routes/shiftRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));

app.get('/', (req, res) => {
    res.send('VIDYUT Attendance Management System Backend is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await connectDB();
    // Sync all models with the database
    await sequelize.sync({ alter: true }); // Use { alter: true } for development to update tables
    console.log('All models were synchronized successfully.');
});