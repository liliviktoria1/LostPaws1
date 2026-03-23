require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const reportRoutes = require('./routes/reports');
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
    res.send('Lost Paws API (PostgreSQL) is running...');
});

// Database Sync and Server Start
sequelize.sync({ force: false }) // Use { force: true } during development if you need to drop/recreate tables
    .then(() => {
        console.log('PostgreSQL Database connected and synced');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });
