const sequelize = require('./config/database');
const PetReport = require('./models/PetReport');

const seedData = async () => {
    try {
        await sequelize.sync({ force: true }); // Warning: This drops and recreates tables
        console.log('Database synced');

        await PetReport.bulkCreate([
            {
                petStatus: 'lost',
                petName: 'Ben',
                petSpecies: 'dog',
                petSex: 'male',
                description: 'Golden Retriever, very friendly.',
                locationAddress: 'Kiev, Yurivka, 08170',
                contactEmail: 'owner1@example.com',
                photos: [{ url: '/assets/image/Ben.jpeg' }]
            },
            {
                petStatus: 'lost',
                petName: 'Murka',
                petSpecies: 'cat',
                petSex: 'female',
                description: 'Tricolor cat, likes milk.',
                locationAddress: 'Lviv, Duliby, 82434',
                contactEmail: 'owner2@example.com',
                photos: [{ url: '/assets/image/Murka.jpeg' }]
            },
            {
                petStatus: 'lost',
                petName: 'Sharik',
                petSpecies: 'dog',
                petSex: 'male',
                description: 'Small black dog with white paws.',
                locationAddress: 'Chernivtsi, 58000',
                contactEmail: 'owner3@example.com',
                photos: [{ url: '/assets/image/Sharik.jpeg' }]
            },
            {
                petStatus: 'found',
                petName: 'Jon',
                petSpecies: 'dog',
                petSex: 'male',
                description: 'Found wandering near the park.',
                locationAddress: 'Kiev, Yurivka, 08170',
                contactEmail: 'finder1@example.com',
                photos: [{ url: '/assets/image/Jon.jpeg' }]
            },
            {
                petStatus: 'found',
                petName: 'Luigi',
                petSpecies: 'cat',
                petSex: 'male',
                description: 'Grey cat with a bell collar.',
                locationAddress: 'Lviv, Duliby, 82434',
                contactEmail: 'finder2@example.com',
                photos: [{ url: '/assets/image/Luigi.png' }]
            },
            {
                petStatus: 'found',
                petName: 'Lisa',
                petSpecies: 'dog',
                petSex: 'female',
                description: 'Friendly husky found near downtown.',
                locationAddress: 'Chernivtsi, 58000',
                contactEmail: 'finder3@example.com',
                photos: [{ url: '/assets/image/Lisa.jpeg' }]
            }
        ]);

        console.log('Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
