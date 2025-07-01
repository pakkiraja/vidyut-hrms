const express = require('express');
const { Designation } = require('../models');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get all designations
// @route   GET /api/designations
// @access  Private (Admin, HR)
router.get('/', protect, authorizeRoles('Admin', 'HR'), async (req, res) => {
    try {
        const designations = await Designation.findAll();
        res.json(designations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create a new designation
// @route   POST /api/designations
// @access  Private (Admin, HR)
router.post('/', protect, authorizeRoles('Admin', 'HR'), async (req, res) => {
    const { name } = req.body;

    try {
        const designationExists = await Designation.findOne({ where: { name } });
        if (designationExists) {
            return res.status(400).json({ message: 'Designation with this name already exists' });
        }

        const designation = await Designation.create({ name });
        res.status(201).json(designation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Update a designation
// @route   PUT /api/designations/:id
// @access  Private (Admin, HR)
router.put('/:id', protect, authorizeRoles('Admin', 'HR'), async (req, res) => {
    const { name } = req.body;

    try {
        const designation = await Designation.findByPk(req.params.id);

        if (designation) {
            designation.name = name || designation.name;
            await designation.save();
            res.json(designation);
        } else {
            res.status(404).json({ message: 'Designation not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Delete a designation
// @route   DELETE /api/designations/:id
// @access  Private (Admin, HR)
router.delete('/:id', protect, authorizeRoles('Admin', 'HR'), async (req, res) => {
    try {
        const designation = await Designation.findByPk(req.params.id);

        if (designation) {
            await designation.destroy();
            res.json({ message: 'Designation removed' });
        } else {
            res.status(404).json({ message: 'Designation not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;