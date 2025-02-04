const mongoose = require('mongoose');

const personalityResponseSchema = new mongoose.Schema({
    questionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'PersonalityQuestion', 
        required: true 
    },
    response: { 
        type: String, 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Userwebapp', 
        required: true 
    },
    points: { 
        type: Number, 
        default: 0  // Adjust logic for points if needed
    },
    status: { 
        type: String, 
        default: 'active' 
    },
}, { timestamps: true });

module.exports = mongoose.model('PersonalityResponse', personalityResponseSchema);
