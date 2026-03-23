const mongoose = require('mongoose');

const PetReportSchema = new mongoose.Schema({
    petStatus: {
        type: String,
        required: true,
        enum: ['lost', 'found']
    },
    petName: {
        type: String,
        required: true
    },
    petSpecies: {
        type: String,
        required: true,
        enum: ['cat', 'dog', 'other']
    },
    petSex: {
        type: String,
        enum: ['female', 'male', 'unknown']
    },
    description: String,
    location: {
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    dateLastSeen: {
        type: Date,
        default: Date.now
    },
    contactName: String,
    contactNumber: String,
    contactEmail: {
        type: String,
        required: true
    },
    photos: [{
        url: String,
        publicId: String // For Cloudinary or similar
    }],
    embedding: [Number], // For AI matching
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PetReport', PetReportSchema);
