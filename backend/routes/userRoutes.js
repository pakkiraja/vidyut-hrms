const express = require('express');
const { User, Role, Department, Designation, Shift } = require('../models');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin, HR)
router.get('/', protect, authorizeRoles('Admin', 'HR'), async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            include: [
                { model: Role, attributes: ['name'] },
                { model: Department, attributes: ['name'] },
                { model: Designation, attributes: ['name'] },
                { model: Shift, attributes: ['name'] },
            ],
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin, HR, or self)
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [
                { model: Role, attributes: ['name'] },
                { model: Department, attributes: ['name'] },
                { model: Designation, attributes: ['name'] },
                { model: Shift, attributes: ['name'] },
            ],
        });

        if (user) {
            // Allow Admin/HR to view any user, or allow user to view their own profile
            if (req.user.role === 'Admin' || req.user.role === 'HR' || req.user.id === req.params.id) {
                res.json(user);
            } else {
                res.status(403).json({ message: 'Not authorized to view this user profile' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private (Admin, HR, or self)
router.put('/:id', protect, async (req, res) => {
    const { firstName, lastName, email, role, mobile, departmentId, designationId, shiftId, isActive } = req.body;

    try {
        const user = await User.findByPk(req.params.id);

        if (user) {
            // Admin/HR can update any user, employees can only update their own profile (excluding role/isActive)
            if (req.user.role === 'Admin' || req.user.role === 'HR' || req.user.id === req.params.id) {
                user.firstName = firstName || user.firstName;
                user.lastName = lastName || user.lastName;
                user.email = email || user.email;
                user.mobile = mobile || user.mobile;
                user.departmentId = departmentId || user.departmentId;
                user.designationId = designationId || user.designationId;
                user.shiftId = shiftId || user.shiftId;

                // Only Admin/HR can change role or isActive status
                if (req.user.role === 'Admin' || req.user.role === 'HR') {
                    user.role = role || user.role;
                    user.isActive = typeof isActive === 'boolean' ? isActive : user.isActive;
                } else if (role || typeof isActive === 'boolean') {
                    return res.status(403).json({ message: 'Not authorized to change role or active status' });
                }

                await user.save();
                res.json({
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                });
            } else {
                res.status(403).json({ message: 'Not authorized to update this user profile' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorizeRoles('Admin'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (user) {
            await user.destroy();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;