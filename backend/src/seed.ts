import sequelize from './config/database.js';
import { PetReport } from './models/PetReport.js';
import { User } from './models/User.js';
import { generatePetEmbedding } from './config/ai.js';
import bcrypt from 'bcryptjs';

const seedData = async () => {
    console.log('--- STARTING REALISTIC AI-TEST SEED PROCESS ---');
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: true });
        console.log('Database schema reset.');

        const hashedPassword = await bcrypt.hash('admin123', 10);
        // John's ID from your active session
        const johnId = '2972a8b5-7289-470b-966d-a913915e49e7'; 

        console.log('Creating users...');
        const users = await User.bulkCreate([
            { id: johnId, name: 'John Owner', email: 'john@example.com', password: hashedPassword },
            { name: 'Sarah Finder', email: 'sarah@example.com', password: hashedPassword },
            { name: 'Mike Helper', email: 'mike@example.com', password: hashedPassword }
        ]);

        const sarahId = users[1].id;
        const mikeId = users[2].id;

        const petReportsData = [
            // SCENARIO 1: PERFECT MATCH (Same Image)
            // John lost Ben. Sarah found Ben.
            {
                petStatus: 'lost', petName: 'Ben', petSpecies: 'dog', petBreed: 'Golden Retriever',
                petColor: 'Golden', petAge: 'adult', petSex: 'male', description: 'Friendly dog, red collar.',
                locationAddress: 'Kiev, Yurivka', locationLat: 50.34, locationLng: 30.36,
                contactEmail: 'john@example.com', photos: [{ url: '/uploads/Ben.jpeg' }], userId: johnId
            },
            {
                petStatus: 'found', petName: 'Found Retriever', petSpecies: 'dog', petBreed: 'Golden Retriever',
                petColor: 'Golden', petAge: 'adult', petSex: 'male', description: 'Found a golden dog with a red collar.',
                locationAddress: 'Kiev, Podil', locationLat: 50.46, locationLng: 30.51,
                contactEmail: 'sarah@example.com', photos: [{ url: '/uploads/Ben.jpeg' }], userId: sarahId
            },
            
            // SCENARIO 2: SAME BREED, DIFFERENT DOG (Should be filtered by AI)
            // Mike found a DIFFERENT Golden Retriever (using Jon.jpeg)
            {
                petStatus: 'found', petName: 'Stray Dog', petSpecies: 'dog', petBreed: 'Golden Retriever',
                petColor: 'Yellow', petAge: 'young', petSex: 'male', description: 'Young retriever found near the lake.',
                locationAddress: 'Kiev, Obolon', locationLat: 50.51, locationLng: 30.50,
                contactEmail: 'mike@example.com', photos: [{ url: '/uploads/Jon.jpeg' }], userId: mikeId
            },

            // SCENARIO 3: CAT MATCH
            // John lost Murka. Mike found her.
            {
                petStatus: 'lost', petName: 'Murka', petSpecies: 'cat', petBreed: 'Siamese',
                petColor: 'Cream/Grey', petAge: 'adult', petSex: 'female', description: 'Siamese cat with blue eyes.',
                locationAddress: 'Kiev, Obolon', locationLat: 50.511, locationLng: 30.501,
                contactEmail: 'john@example.com', photos: [{ url: '/uploads/Murka.jpeg' }], userId: johnId
            },
            {
                petStatus: 'found', petName: 'Beautiful Cat', petSpecies: 'cat', petBreed: 'Siamese',
                petColor: 'Grey points', petAge: 'adult', petSex: 'female', description: 'Found a siamese cat wandering.',
                locationAddress: 'Kiev, Center', locationLat: 50.45, locationLng: 30.52,
                contactEmail: 'mike@example.com', photos: [{ url: '/uploads/Murka.jpeg' }], userId: mikeId
            }
        ];

        console.log(`Generating embeddings for ${petReportsData.length} reports...`);
        for (const pet of petReportsData) {
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
        console.log(`Lost and Found pairs are now owned by DIFFERENT users.`);
        console.log(`Ben (Lost) and Found Retriever (Found) use the SAME image for a guaranteed match.`);
        process.exit(0);
    } catch (error: any) {
        console.error('SEEDING FAILED:', error.message);
        process.exit(1);
    }
};

seedData();
