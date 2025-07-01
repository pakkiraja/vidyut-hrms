const express = require('express');
const { Department } = require('../models');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private (Admin, HR)
router.get('/', protect, authorizeRoles('Admin', 'HR'), async (req, res) => {
    try {
        const departments = await Department.findAll();
        res.json(departments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private (Admin, HR)
router.post('/', protect, authorizeRoles('Admin', 'HR'), async (req, res) => {
    const { name } = req.body;

    try {
        const departmentExists = await Department.findOne({ where: { name } });
        if (departmentExists) {
            return res.status(400).json({ message: 'Department with this name already exists' });
        }

        const department = await Department.create({ name });
        res.status(201).json(department);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private (Admin, HR)
router.put('/:id', protect, authorizeRoles('Admin', 'HR'), async (req, res) => {
    const { name } = req.body;

    try {
        const department = await Department.findByPk(req.params.id);

        if (department) {
            department.name = name || department.name;
            await department.save();
            res.json(department);
        } else {
            res.status(404).json({ message: 'Department not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private (Admin, HR)
router.delete('/:id', protect, authorizeRoles('Admin', 'HR'), async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);

        if (department) {
            await department.destroy();
            res.json({ message: 'Department removed' });
        } else {
            res.status(404).json({ message: 'Department not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;