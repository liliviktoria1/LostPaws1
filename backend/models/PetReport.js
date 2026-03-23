const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PetReport = sequelize.define('PetReport', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    petStatus: {
        type: DataTypes.ENUM('lost', 'found'),
        allowNull: false
    },
    petName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    petSpecies: {
        type: DataTypes.ENUM('cat', 'dog', 'other'),
        allowNull: false
    },
    petSex: {
        type: DataTypes.ENUM('female', 'male', 'unknown'),
        defaultValue: 'unknown'
    },
    description: {
        type: DataTypes.TEXT
    },
    locationAddress: {
        type: DataTypes.STRING
    },
    locationLat: {
        type: DataTypes.FLOAT
    },
    locationLng: {
        type: DataTypes.FLOAT
    },
    dateLastSeen: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    contactName: {
        type: DataTypes.STRING
    },
    contactNumber: {
        type: DataTypes.STRING
    },
    contactEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    photos: {
        type: DataTypes.JSONB, // Store photo URLs as an array in JSONB format
        defaultValue: []
    },
    embedding: {
        type: DataTypes.ARRAY(DataTypes.FLOAT), // For AI matching
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = PetReport;
