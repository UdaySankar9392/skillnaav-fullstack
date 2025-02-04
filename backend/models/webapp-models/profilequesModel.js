const mongoose = require('mongoose');

// Define the PersonalityQuestion schema
const personalityQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    responseScale: {
        type: [Number],
        required: true,
    },
});

// Create the PersonalityQuestion model
const PersonalityQuestion = mongoose.model('PersonalityQuestion', personalityQuestionSchema);

module.exports = PersonalityQuestion;
