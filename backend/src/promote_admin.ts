import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { User } from './models/User.js';
import sequelize from './config/database.js';

const promoteUser = async () => {
    const email = process.argv[2];
    if (!email) {
        console.error('Please provide an email address.');
        process.exit(1);
    }

    try {
        await sequelize.authenticate();
        const [updatedCount] = await User.update(
            { role: 'admin' },
            { where: { email: email.toLowerCase() } }
        );

        if (updatedCount > 0) {
            console.log(`✅ User ${email} has been promoted to Admin.`);
        } else {
            console.log(`ℹ️ No user found with email ${email}.`);
        }
    } catch (error) {
        console.error('❌ Error promoting user:', error);
    } finally {
        await sequelize.close();
    }
};

promoteUser();
