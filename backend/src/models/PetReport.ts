import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface PetReportAttributes {
    id: string;
    petStatus: 'lost' | 'found';
    petName: string;
    petSpecies: 'cat' | 'dog' | 'other';
    petBreed?: string;
    petColor?: string;
    petAge?: 'baby' | 'young' | 'adult' | 'senior';
    petSex?: 'female' | 'male' | 'unknown';
    description?: string;
    locationAddress?: string;
    locationLat?: number;
    locationLng?: number;
    dateLastSeen?: Date;
    contactName?: string;
    contactNumber?: string;
    contactEmail: string;
    photos?: { url: string }[];
    embedding?: number[];
    userId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PetReportCreationAttributes extends Optional<PetReportAttributes, 'id'> {}

class PetReport extends Model<PetReportAttributes, PetReportCreationAttributes> implements PetReportAttributes {
    public id!: string;
    public petStatus!: 'lost' | 'found';
    public petName!: string;
    public petSpecies!: 'cat' | 'dog' | 'other';
    public petSex!: 'female' | 'male' | 'unknown';
    public description!: string;
    public locationAddress!: string;
    public locationLat!: number;
    public locationLng!: number;
    public dateLastSeen!: Date;
    public contactName!: string;
    public contactNumber!: string;
    public contactEmail!: string;
    public photos!: { url: string }[];
    public embedding!: number[];
    public userId!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

PetReport.init({
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
    petBreed: {
        type: DataTypes.STRING,
        allowNull: true
    },
    petColor: {
        type: DataTypes.STRING,
        allowNull: true
    },
    petAge: {
        type: DataTypes.ENUM('baby', 'young', 'adult', 'senior'),
        defaultValue: 'young'
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
        type: DataTypes.JSONB,
        defaultValue: []
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    embedding: {
        type: DataTypes.ARRAY(DataTypes.FLOAT),
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'PetReport',
    timestamps: true
});

export { PetReport };
