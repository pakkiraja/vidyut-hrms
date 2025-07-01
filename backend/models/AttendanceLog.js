const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AttendanceLog = sequelize.define('AttendanceLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    punchType: {
        type: DataTypes.ENUM('check-in', 'check-out'),
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    latitude: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    longitude: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    photoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    batteryStatus: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    networkStatus: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isOfflinePunch: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    syncedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: true,
});

module.exports = AttendanceLog;