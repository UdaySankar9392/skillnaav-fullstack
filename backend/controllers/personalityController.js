const mongoose = require('mongoose');
const PersonalityResponse = require('../models/webapp-models/personalityModel');
const PersonalityQuestion = require('../models/webapp-models/profilequesModel');

// Mapping from response text to points (if needed)
const responseMap = {
    "Dislike": 1,
    "Slightly Dislike": 2,
    "Neutral": 3,
    "Slightly Enjoy": 4,
    "Enjoy": 5
};

// Get all questions
const getQuestions = async (req, res) => {
    try {
        const questions = await PersonalityQuestion.find({ isActive: true });
        if (questions.length > 0) {
            return res.status(200).json(questions);
        } else {
            return res.status(404).json({ message: 'No active questions found' });
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
        return res.status(500).json({ message: 'Error fetching questions' });
    }
};

// Get responses for a specific user
const getUserResponses = async (req, res) => {
    try {
        const { userId } = req.query; // Updated to query parameter

        const responses = await PersonalityResponse.find({ userId })
            .populate('questionId', 'question')
            .exec();

        return res.status(200).json(responses || []);
    } catch (error) {
        console.error("Error fetching responses:", error);
        res.status(500).json({ message: "Error fetching responses", error });
    }
};

// Get responses for a specific question
const getQuestionResponses = async (req, res) => {
    try {
        const questionId = req.params.questionId;

        const responses = await PersonalityResponse.find({ questionId });

        if (!responses.length) {
            return res.status(404).json({ message: 'No responses found for this question' });
        }

        res.status(200).json(responses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching responses', error });
    }
};

// Save bulk answers
const saveBulkAnswers = async (req, res) => {
    try {
        console.log("Received bulk answers:", req.body);

        if (!req.body.responses || !Array.isArray(req.body.responses)) {
            return res.status(400).json({ error: "Invalid request format" });
        }

        const responses = req.body.responses.map(response => {
            // Ensure required fields are present
            if (!response.questionId || !response.userId || !response.response) {
                throw new Error("questionId, userId, and response are required for all responses.");
            }
            // Use points from request if provided; otherwise, derive from response string
            const points = response.points || responseMap[response.response];
            if (!points || points < 1 || points > 5) {
                throw new Error(`Invalid points value for response: ${response.response}`);
            }
            return {
                questionId: response.questionId,
                response: response.response,
                userId: response.userId,
                points: points
            };
        });

        await PersonalityResponse.insertMany(responses);
        res.status(201).json({ message: "Bulk answers saved successfully!" });
    } catch (error) {
        console.error("Error saving bulk answers:", error);
        res.status(400).json({ error: error.message });
    }
};

// Calculate personality based on user responses
const calculateUserPersonality = async (req, res) => {
    try {
        const { userId } = req.query;

        // Validate userId
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid or missing userId" });
        }

        // Fetch all user responses and populate question to access riasecTrait
        const responses = await PersonalityResponse.find({ userId })
            .populate("questionId")
            .exec();

        if (!responses.length) {
            return res.status(404).json({ message: "No responses found" });
        }

        // Initialize trait scores for the 6 RIASEC traits
        const traitScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

        // Tally points for each response using the question's riasecTrait
        responses.forEach((response) => {
            const trait = response.questionId && response.questionId.riasecTrait;
            if (trait && traitScores.hasOwnProperty(trait)) {
                traitScores[trait] += response.points;
            } else {
                console.warn(`Unknown or missing trait for response ${response._id}`);
            }
        });

        // Sort traits by score in descending order
        const sortedTraits = Object.entries(traitScores)
            .sort((a, b) => b[1] - a[1])
            .map(([trait]) => trait);

        // Take the top 3 for the Holland Code
        const top3 = sortedTraits.slice(0, 3);

        res.status(200).json({
            hollandCode: top3.join(""), // e.g. "RIA"
            scores: traitScores,
            dominantTraits: top3,
        });
    } catch (error) {
        console.error("Error calculating personality:", error);
        res.status(500).json({ message: "Calculation error", error: error.message });
    }
};

module.exports = {
    getQuestions,
    getUserResponses,
    getQuestionResponses,
    saveBulkAnswers,
    calculateUserPersonality,
};
