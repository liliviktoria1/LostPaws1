import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

export interface NotificationAttributes {
    id: string;
    userId: string;
    message: string;
    reportId?: string;
    isRead: boolean;
    type: 'match_alert' | 'system';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'isRead' | 'type'> {}

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
    public id!: string;
    public userId!: string;
    public message!: string;
    public reportId!: string;
    public isRead!: boolean;
    public type!: 'match_alert' | 'system';

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Notification.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    reportId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    type: {
        type: DataTypes.ENUM('match_alert', 'system'),
        defaultValue: 'system'
    }
}, {
    sequelize,
    modelName: 'Notification',
    timestamps: true
});

// Setup associations
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

export default Notification;
