require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const reportRoutes = require('./routes/reports');
app.use('/api/reports', reportRoutes);

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lostpaws')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

app.get('/', (req, res) => {
    res.send('Lost Paws API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
