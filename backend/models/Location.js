const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Location = sequelize.define('Location', {
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
    geoFenceCoordinates: {
        type: DataTypes.JSONB, // Store GeoJSON or array of coordinates
        allowNull: true,
    },
}, {
    timestamps: true,
});

module.exports = Location;