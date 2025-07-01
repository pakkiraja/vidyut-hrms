const express = require('express');
const { AttendanceLog, User, Location, Shift } = require('../models');
const { Op } = require('sequelize');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure Multer for file uploads (for selfies)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/selfies';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });

// Helper function to check if a point is inside a polygon (geo-fencing)
// This is a simplified implementation. For production, consider a dedicated geospatial library.
const isPointInPolygon = (point, polygon) => {
    // point: [longitude, latitude]
    // polygon: [[lon1, lat1], [lon2, lat2], ...]
    let x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        let xi = polygon[i][0], yi = polygon[i][1];
        let xj = polygon[j][0], yj = polygon[j][1];

        let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

// @desc    Record check-in/check-out
// @route   POST /api/attendance/punch
// @access  Private (Employee)
router.post('/punch', protect, upload.single('selfie'), async (req, res) => {
    const { latitude, longitude, punchType, batteryStatus, networkStatus } = req.body;
    const userId = req.user.id;
    const photoUrl = req.file ? `/uploads/selfies/${req.file.filename}` : null;

    try {
        // Validate geo-location against defined office locations (geo-fencing)
        const locations = await Location.findAll();
        let isInGeoFence = false;
        for (const loc of locations) {
            if (loc.geoFenceCoordinates && loc.geoFenceCoordinates.coordinates) {
                // Assuming geoFenceCoordinates.coordinates is an array of [lon, lat] pairs for a polygon
                // For simplicity, assuming a single polygon. Real-world might have multi-polygons.
                if (isPointInPolygon([parseFloat(longitude), parseFloat(latitude)], loc.geoFenceCoordinates.coordinates[0])) {
                    isInGeoFence = true;
                    break;
                }
            }
        }

        if (!isInGeoFence) {
            // Optionally, allow punch but mark as geo-fence violation
            // For now, we'll reject it if outside geo-fence
            if (photoUrl && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path); // Delete uploaded photo if punch is rejected
            }
            return res.status(400).json({ message: 'Punch location is outside designated office areas.' });
        }

        const attendance = await AttendanceLog.create({
            userId,
            punchType,
            timestamp: new Date(),
            latitude,
            longitude,
            photoUrl,
            batteryStatus,
            networkStatus,
            isOfflinePunch: false, // This API assumes online punch
        });

        res.status(201).json({ message: 'Punch recorded successfully', attendance });
    } catch (error) {
        console.error(error);
        if (photoUrl && req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path); // Delete uploaded photo on error
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get attendance summary for mobile dashboard
// @route   GET /api/attendance/summary/:userId
// @access  Private (Employee or Admin/HR for others)
router.get('/summary/:userId', protect, async (req, res) => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query; // Optional date range

    // Ensure user can only view their own summary unless Admin/HR
    if (req.user.id !== userId && req.user.role !== 'Admin' && req.user.role !== 'HR') {
        return res.status(403).json({ message: 'Not authorized to view this attendance summary' });
    }

    try {
        let whereClause = { userId };
        if (startDate && endDate) {
            whereClause.timestamp = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }

        const attendanceLogs = await AttendanceLog.findAll({
            where: whereClause,
            order: [['timestamp', 'ASC']],
            include: [{ model: User, attributes: ['firstName', 'lastName'] }],
        });

        // Basic summary calculation (can be expanded)
        const summary = {
            totalPunches: attendanceLogs.length,
            checkIns: attendanceLogs.filter(log => log.punchType === 'check-in').length,
            checkOuts: attendanceLogs.filter(log => log.punchType === 'check-out').length,
            // Add more complex calculations like total hours, late/absent days here
        };

        res.json({ summary, logs: attendanceLogs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get detailed attendance logs (for admin panel)
// @route   GET /api/attendance/logs
// @access  Private (Admin, HR)
router.get('/logs', protect, authorizeRoles('Admin', 'HR'), async (req, res) => {
    const { employeeId, departmentId, startDate, endDate } = req.query;

    let whereClause = {};
    let userWhereClause = {};

    if (employeeId) {
        whereClause.userId = employeeId;
    }
    if (startDate && endDate) {
        whereClause.timestamp = {
            [Op.between]: [new Date(startDate), new Date(endDate)],
        };
    }

    if (departmentId) {
        userWhereClause.departmentId = departmentId;
    }

    try {
        const logs = await AttendanceLog.findAll({
            where: whereClause,
            order: [['timestamp', 'DESC']],
            include: [
                {
                    model: User,
                    attributes: ['firstName', 'lastName', 'email', 'role'],
                    where: userWhereClause,
                    required: true, // Ensure only users matching department filter are included
                },
            ],
        });
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;