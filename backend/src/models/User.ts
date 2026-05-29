import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface UserAttributes {
    id: string;
    name: string;
    email: string;
    password?: string;
    phoneNumber?: string;
    role?: 'user' | 'admin';
    isVerified?: boolean;
    verificationCode?: string;
    verificationCodeExpires?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: string;
    public name!: string;
    public email!: string;
    public password!: string;
    public phoneNumber!: string;
    public role!: 'user' | 'admin';
    public isVerified!: boolean;
    public verificationCode!: string;
    public verificationCodeExpires!: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user'
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    verificationCode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    verificationCodeExpires: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'User',
    timestamps: true
});

export { User };
