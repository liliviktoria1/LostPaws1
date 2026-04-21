import sequelize from './config/database.js';
import { PetReport } from './models/PetReport.js';
import { User } from './models/User.js';
import { generatePetEmbedding } from './config/ai.js';
import bcrypt from 'bcryptjs';

const seedData = async () => {
    console.log('--- STARTING HIGH-LOGIC SEED PROCESS ---');
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: true });

        const hashedPassword = await bcrypt.hash('admin123', 10);
        const johnId = '2972a8b5-7289-470b-966d-a913915e49e7'; 

        console.log('Creating unique users...');
        const userList = [
            { id: johnId, name: 'John Owner', email: 'john@example.com', password: hashedPassword },
            { name: 'Sarah Finder', email: 'sarah@example.com', password: hashedPassword },
            { name: 'Mike LostCat', email: 'mike@example.com', password: hashedPassword },
            { name: 'Anna CatFinder', email: 'anna@example.com', password: hashedPassword },
            { name: 'Dmitro Odesa', email: 'dmitro@example.com', password: hashedPassword },
            { name: 'Elena Lviv', email: 'elena@example.com', password: hashedPassword },
            { name: 'Admin User', email: 'admin@lostpaws.com', password: hashedPassword }
        ];

        const users = await User.bulkCreate(userList);

        const reports = [
            // SCENARIO: BEN (DOG)
            {
                petStatus: 'lost', petName: 'Ben', petSpecies: 'dog', petBreed: 'Golden Retriever',
                petColor: 'Golden', petAge: 'adult', petSex: 'male', description: 'He has a red collar and a small scar on his left paw.',
                locationAddress: 'Kiev, Yurivka', locationLat: 50.34, locationLng: 30.36,
                contactEmail: 'john@example.com', photos: [{ url: '/uploads/Ben.jpeg' }], userId: johnId
            },
            {
                petStatus: 'found', petName: 'Found Retriever', petSpecies: 'dog', petBreed: 'Golden Retriever',
                petColor: 'Golden/Yellow', petAge: 'adult', petSex: 'male', description: 'Found a very friendly retriever with a red collar near the park.',
                locationAddress: 'Kiev, Podil', locationLat: 50.46, locationLng: 30.51,
                contactEmail: 'sarah@example.com', photos: [{ url: '/uploads/Ben.jpeg' }], userId: users[1].id
            },

            // SCENARIO: MURKA (CAT)
            {
                petStatus: 'lost', petName: 'Murka', petSpecies: 'cat', petBreed: 'Siamese',
                petColor: 'Cream', petAge: 'young', petSex: 'female', description: 'Blue eyes, very vocal Siamese cat.',
                locationAddress: 'Lviv, Rynok Square', locationLat: 49.841, locationLng: 24.031,
                contactEmail: 'mike@example.com', photos: [{ url: '/uploads/Murka.jpeg' }], userId: users[2].id
            },
            {
                petStatus: 'found', petName: 'Beautiful Siamese', petSpecies: 'cat', petBreed: 'Siamese',
                petColor: 'Cream/Grey', petAge: 'young', petSex: 'female', description: 'Siamese cat found near the city center. Very friendly.',
                locationAddress: 'Lviv, Center', locationLat: 49.840, locationLng: 24.029,
                contactEmail: 'anna@example.com', photos: [{ url: '/uploads/Murka.jpeg' }], userId: users[3].id
            },

            // OTHER INDEPENDENT REPORTS
            {
                petStatus: 'found', petName: 'Sharik', petSpecies: 'dog', petBreed: 'Mixed',
                petColor: 'Black', petAge: 'young', petSex: 'male', description: 'Small black dog found on the beach.',
                locationAddress: 'Odesa, Arcadia', locationLat: 46.42, locationLng: 30.76,
                contactEmail: 'dmitro@example.com', photos: [{ url: '/uploads/Sharik.jpeg' }], userId: users[4].id
            },
            {
                petStatus: 'lost', petName: 'Lisa', petSpecies: 'dog', petBreed: 'Husky',
                petColor: 'Grey/White', petAge: 'adult', petSex: 'female', description: 'Grey husky with blue eyes. Ran away near the station.',
                locationAddress: 'Lviv, Station', locationLat: 49.83, locationLng: 23.99,
                contactEmail: 'elena@example.com', photos: [{ url: '/uploads/Lisa.jpeg' }], userId: users[5].id
            }
        ];

        console.log(`Generating AI embeddings for ${reports.length} logical reports...`);
        for (const pet of reports) {
            process.stdout.write(`.`);
            const embedding = await generatePetEmbedding({
                petSpecies: pet.petSpecies,
                description: pet.description,
                suggestedBreed: pet.petBreed,
                primaryColor: pet.petColor
            });

            await PetReport.create({
                ...pet,
                embedding
            } as any);
        }

        console.log('\nDone.');
        console.log(`--- SEEDING COMPLETED ---`);
        console.log(`John (You) only has 1 lost pet: Ben.`);
        console.log(`Sarah has found a dog that matches Ben.`);
        process.exit(0);
    } catch (error: any) {
        console.error('SEEDING FAILED:', error.message);
        process.exit(1);
    }
};

seedData();
