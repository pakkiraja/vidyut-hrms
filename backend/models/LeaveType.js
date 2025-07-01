const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LeaveType = sequelize.define('LeaveType', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    timestamps: true,
});

module.exports = LeaveType;