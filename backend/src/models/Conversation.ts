import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface ConversationAttributes {
    id: string;
    user1Id: string;
    user2Id: string;
    reportId?: string;
    lastMessage?: string;
    lastMessageAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'id'> {}

class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
    public id!: string;
    public user1Id!: string;
    public user2Id!: string;
    public reportId?: string;
    public lastMessage?: string;
    public lastMessageAt?: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Conversation.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user1Id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    user2Id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    reportId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    lastMessage: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    lastMessageAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Conversation',
    timestamps: true
});

export { Conversation };
