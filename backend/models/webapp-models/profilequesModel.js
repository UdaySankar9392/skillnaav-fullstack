const mongoose = require('mongoose');

const personalityQuestionSchema = new mongoose.Schema({
    question: { 
        type: String, 
        required: true,
        unique: true
    },
    responseScale: {
        type: [Number],
        default: [1, 2, 3, 4, 5],
        validate: {
            validator: function(v) {
                return v.length === 5 && 
                    v.every((n, i) => n === i+1); // Validate scale is [1,2,3,4,5]
            },
            message: props => `Response scale must be [1,2,3,4,5]`
        }
    },
    riasecTrait: {
        type: String,
        required: true,
        enum: ['R', 'I', 'A', 'S', 'E', 'C'],
        uppercase: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('PersonalityQuestion', personalityQuestionSchema);