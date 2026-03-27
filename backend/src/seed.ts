import sequelize from './config/database.js';
import PetReport from './models/PetReport.js';

const seedData = async () => {
    try {
        await sequelize.sync({ force: true });
        console.log('Database synced');

        await (PetReport as any).bulkCreate([
            {
                petStatus: 'lost',
                petName: 'Ben',
                petSpecies: 'dog',
                petSex: 'male',
                description: 'Golden Retriever, very friendly.',
                locationAddress: 'Kiev, Yurivka',
                locationLat: 50.3400,
                locationLng: 30.3600,
                contactEmail: 'owner1@example.com',
                photos: [{ url: '/assets/image/Ben.jpeg' }]
            },
            {
                petStatus: 'lost',
                petName: 'Murka',
                petSpecies: 'cat',
                petSex: 'female',
                description: 'Tricolor cat, likes milk.',
                locationAddress: 'Lviv, Duliby',
                locationLat: 49.2300,
                locationLng: 23.8300,
                contactEmail: 'owner2@example.com',
                photos: [{ url: '/assets/image/Murka.jpeg' }]
            },
            {
                petStatus: 'lost',
                petName: 'Sharik',
                petSpecies: 'dog',
                petSex: 'male',
                description: 'Small black dog with white paws.',
                locationAddress: 'Chernivtsi, Center',
                locationLat: 48.2908,
                locationLng: 25.9345,
                contactEmail: 'owner3@example.com',
                photos: [{ url: '/assets/image/Sharik.jpeg' }]
            },
            {
                petStatus: 'found',
                petName: 'Jon',
                petSpecies: 'dog',
                petSex: 'male',
                description: 'Found wandering near the park.',
                locationAddress: 'Kiev, Podil',
                locationLat: 50.4600,
                locationLng: 30.5100,
                contactEmail: 'finder1@example.com',
                photos: [{ url: '/assets/image/Jon.jpeg' }]
            },
            {
                petStatus: 'found',
                petName: 'Luigi',
                petSpecies: 'cat',
                petSex: 'male',
                description: 'Grey cat with a bell collar.',
                locationAddress: 'Lviv, Rynok Square',
                locationLat: 49.8419,
                locationLng: 24.0315,
                contactEmail: 'finder2@example.com',
                photos: [{ url: '/assets/image/Luigi.png' }]
            },
            {
                petStatus: 'found',
                petName: 'Lisa',
                petSpecies: 'dog',
                petSex: 'female',
                description: 'Friendly husky found near downtown.',
                locationAddress: 'Chernivtsi, University',
                locationLat: 48.2970,
                locationLng: 25.9240,
                contactEmail: 'finder3@example.com',
                photos: [{ url: '/assets/image/Lisa.jpeg' }]
            }
        ]);

        console.log('Database seeded successfully with coordinates!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
