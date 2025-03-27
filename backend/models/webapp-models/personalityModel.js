const mongoose = require('mongoose');

const personalityResponseSchema = new mongoose.Schema({
    questionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "PersonalityQuestion", 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    response: { 
        type: String, 
        required: true,
        enum: ["Dislike", "Slightly Dislike", "Neutral", "Slightly Enjoy", "Enjoy"]
    },
    points: { 
        type: Number, 
        required: true,
        min: 1,
        max: 5
    },
    respondedAt: {
        type: Date,
        default: Date.now
    }
}, {
    indexes: [
        { fields: { userId: 1, questionId: 1 }, unique: true }
    ]
});

module.exports = mongoose.model('PersonalityResponse', personalityResponseSchema);