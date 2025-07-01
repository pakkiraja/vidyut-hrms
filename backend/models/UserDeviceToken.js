const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserDeviceToken = sequelize.define('UserDeviceToken', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    fcmToken: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    timestamps: true,
});

module.exports = UserDeviceToken;