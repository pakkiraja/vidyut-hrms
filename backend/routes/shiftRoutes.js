const express = require('express');
const { Shift } = require('../models');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get all shifts
// @route   GET /api/shifts
// @access  Private (Admin, HR)
router.get('/', protect, authorizeRoles('Admin', 'HR'), async (req, res) => {
    try {
        const shifts = await Shift.findAll();
        res.json(shifts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create a new shift
// @route   POST /api/shifts
// @access  Private (Admin, HR)
router.post('/', protect, authorizeRoles('Admin', 'HR'), async (req, res) => {
    const { name, startTime, endTime, gracePeriodMinutes } = req.body;

    try {
        const shiftExists = await Shift.findOne({ where: { name } });
        if (shiftExists) {
            return res.status(400).json({ message: 'Shift with this name already exists' });
        }

        const shift = await Shift.create({ name, startTime, endTime, gracePeriodMinutes });
        res.status(201).json(shift);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Update a shift
// @route   PUT /api/shifts/:id
// @access  Private (Admin, HR)
router.put('/:id', protect, authorizeRoles('Admin', 'HR'), async (req, res) => {
    const { name, startTime, endTime, gracePeriodMinutes } = req.body;

    try {
        const shift = await Shift.findByPk(req.params.id);

        if (shift) {
            shift.name = name || shift.name;
            shift.startTime = startTime || shift.startTime;
            shift.endTime = endTime || shift.endTime;
            shift.gracePeriodMinutes = gracePeriodMinutes !== undefined ? gracePeriodMinutes : shift.gracePeriodMinutes;
            await shift.save();
            res.json(shift);
        } else {
            res.status(404).json({ message: 'Shift not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Delete a shift
// @route   DELETE /api/shifts/:id
// @access  Private (Admin, HR)
router.delete('/:id', protect, authorizeRoles('Admin', 'HR'), async (req, res) => {
    try {
        const shift = await Shift.findByPk(req.params.id);

        if (shift) {
            await shift.destroy();
            res.json({ message: 'Shift removed' });
        } else {
            res.status(404).json({ message: 'Shift not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;