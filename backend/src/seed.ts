import sequelize from './config/database.js';
import PetReport from './models/PetReport.js';

const seedData = async () => {
    try {
        await sequelize.sync({ force: true });
        console.log('Database synced');

        const pets = [
            // Lost Dogs
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
                petStatus: 'lost',
                petName: 'Buddy',
                petSpecies: 'dog',
                petSex: 'male',
                description: 'Playful labrador, yellow coat.',
                locationAddress: 'Kiev, Obolon',
                locationLat: 50.5100,
                locationLng: 30.5000,
                contactEmail: 'owner4@example.com',
                photos: [{ url: '/assets/image/Ben.jpeg' }]
            },
            {
                petStatus: 'lost',
                petName: 'Rex',
                petSpecies: 'dog',
                petSex: 'male',
                description: 'German Shepherd, protective but kind.',
                locationAddress: 'Lviv, Sykhiv',
                locationLat: 49.7900,
                locationLng: 24.0600,
                contactEmail: 'owner5@example.com',
                photos: [{ url: '/assets/image/Jon.jpeg' }]
            },
            {
                petStatus: 'lost',
                petName: 'Bella',
                petSpecies: 'dog',
                petSex: 'female',
                description: 'Small white poodle, very active.',
                locationAddress: 'Odessa, Arcadia',
                locationLat: 46.4200,
                locationLng: 30.7600,
                contactEmail: 'owner6@example.com',
                photos: [{ url: '/assets/image/Lisa.jpeg' }]
            },
            
            // Lost Cats
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
                petName: 'Luna',
                petSpecies: 'cat',
                petSex: 'female',
                description: 'Black cat with green eyes.',
                locationAddress: 'Kiev, Pechersk',
                locationLat: 50.4300,
                locationLng: 30.5400,
                contactEmail: 'owner7@example.com',
                photos: [{ url: '/assets/image/Luigi.png' }]
            },
            {
                petStatus: 'lost',
                petName: 'Simba',
                petSpecies: 'cat',
                petSex: 'male',
                description: 'Ginger cat, very fluffy.',
                locationAddress: 'Kharkiv, Saltivka',
                locationLat: 49.9900,
                locationLng: 36.3500,
                contactEmail: 'owner8@example.com',
                photos: [{ url: '/assets/image/Murka.jpeg' }]
            },

            // Found Dogs
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
                petName: 'Lisa',
                petSpecies: 'dog',
                petSex: 'female',
                description: 'Friendly husky found near downtown.',
                locationAddress: 'Chernivtsi, University',
                locationLat: 48.2970,
                locationLng: 25.9240,
                contactEmail: 'finder3@example.com',
                photos: [{ url: '/assets/image/Lisa.jpeg' }]
            },
            {
                petStatus: 'found',
                petName: 'Duke',
                petSpecies: 'dog',
                petSex: 'male',
                description: 'Large brown dog, very calm.',
                locationAddress: 'Kiev, Troieshchyna',
                locationLat: 50.5200,
                locationLng: 30.6000,
                contactEmail: 'finder4@example.com',
                photos: [{ url: '/assets/image/Sharik.jpeg' }]
            },
            {
                petStatus: 'found',
                petName: 'Molly',
                petSpecies: 'dog',
                petSex: 'female',
                description: 'Small beagle, looks lost.',
                locationAddress: 'Lviv, Old Town',
                locationLat: 49.8400,
                locationLng: 24.0300,
                contactEmail: 'finder5@example.com',
                photos: [{ url: '/assets/image/Lisa.jpeg' }]
            },

            // Found Cats
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
                petName: 'Oliver',
                petSpecies: 'cat',
                petSex: 'male',
                description: 'Tabby cat found in the garden.',
                locationAddress: 'Kiev, Holosiiv',
                locationLat: 50.3900,
                locationLng: 30.5100,
                contactEmail: 'finder6@example.com',
                photos: [{ url: '/assets/image/Murka.jpeg' }]
            },
            {
                petStatus: 'found',
                petName: 'Chloe',
                petSpecies: 'cat',
                petSex: 'female',
                description: 'White cat, very shy.',
                locationAddress: 'Odessa, City Center',
                locationLat: 46.4800,
                locationLng: 30.7300,
                contactEmail: 'finder7@example.com',
                photos: [{ url: '/assets/image/Luigi.png' }]
            }
        ];

        await (PetReport as any).bulkCreate(pets);

        console.log(`Database seeded successfully with ${pets.length} pets!`);
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
