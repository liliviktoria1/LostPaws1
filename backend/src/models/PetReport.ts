import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export interface PetReportAttributes {
    id: string;
    petStatus: 'lost' | 'found';
    petName: string;
    petSpecies: 'cat' | 'dog' | 'other';
    petSex?: 'female' | 'male' | 'unknown';
    description?: string;
    locationAddress?: string;
    locationLat?: number;
    locationLng?: number;
    dateLastSeen?: Date;
    contactName?: string;
    contactNumber?: string;
    contactEmail: string;
    photos?: any;
    embedding?: number[];
}

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
    userId: {
        type: DataTypes.UUID,
        allowNull: true, // Allow anonymous reports for now
    },
    embedding: {
        type: DataTypes.ARRAY(DataTypes.FLOAT), // For AI matching
        allowNull: true
    }
}, {
    timestamps: true
});

export default PetReport;
