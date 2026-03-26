import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'lost_paws_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'yourpassword',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: false, // set to console.log to see raw queries
    }
);

export default sequelize;
