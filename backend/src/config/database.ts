import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: any = {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    }
};

const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, dbConfig)
    : new Sequelize(
        process.env.DB_NAME || 'lost_paws_db',
        process.env.DB_USER || 'postgres',
        process.env.DB_PASSWORD || 'yourpassword',
        {
            ...dbConfig,
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
        }
    );

export default sequelize;
