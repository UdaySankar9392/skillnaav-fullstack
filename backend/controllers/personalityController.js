const mongoose = require('mongoose');
const PersonalityResponse = require('../models/webapp-models/personalityModel');
const PersonalityQuestion = require('../models/webapp-models/profilequesModel');
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

// Calculate personality using the AI agent based on user responses
// Calculate personality using the AI agent based on user responses
const calculateUserPersonality = async (req, res) => {
    try {
        const { userId } = req.query;

        // Validate userId
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            console.error("Invalid or missing userId:", userId);
            return res.status(400).json({ message: "Invalid or missing userId" });
        }

        // Fetch all user responses and populate question details
        const responses = await PersonalityResponse.find({ userId })
            .populate("questionId")
            .exec();

        if (!responses.length) {
            console.error("No responses found for userId:", userId);
            return res.status(404).json({ message: "No responses found" });
        }

        // Calculate scores locally first
        const traitScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
        responses.forEach(response => {
            if (response.questionId?.riasecTrait && traitScores.hasOwnProperty(response.questionId.riasecTrait)) {
                traitScores[response.questionId.riasecTrait] += response.points || 0;
            }
        });

        // Get top 3 traits
        const sortedTraits = Object.entries(traitScores)
            .sort((a, b) => b[1] - a[1])
            .map(([trait]) => trait);
        const hollandCode = sortedTraits.slice(0, 3).join('');

        // Build a summary of responses for the prompt
        const userResponsesSummary = responses.map(response => ({
            question: response.questionId.question,
            trait: response.questionId.riasecTrait,
            response: response.response,
            points: response.points
        }));

        // Create the prompt for the AI agent to verify our calculation
        const prompt = `
You are a psychology expert specialized in RIASEC personality assessments.
Below are the responses from a RIASEC test with calculated scores:

Responses:
${JSON.stringify(userResponsesSummary, null, 2)}

Calculated Scores:
${JSON.stringify(traitScores, null, 2)}

Please verify these scores and return the full Holland Code (top 3 traits) in this exact JSON format:
{
    "hollandCode": "ABC",
    "dominantTraits": ["A", "B", "C"],
    "scores": {
        "R": 0,
        "I": 0,
        "A": 0,
        "S": 0,
        "E": 0,
        "C": 0
    }
}
`;

        // Call OpenAI API to verify our calculation
        const aiResponse = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: "You are a psychology expert verifying RIASEC test results." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            max_tokens: 4096,
            temperature: 0.3  // Lower temperature for more consistent results
        });

        // Parse the AI response
        let aiResults;
        try {
            aiResults = JSON.parse(aiResponse.choices[0].message.content);
        } catch (e) {
            console.error("Failed to parse AI response:", e);
            // Fall back to our calculation if parsing fails
            aiResults = {
                hollandCode,
                dominantTraits: sortedTraits.slice(0, 3),
                scores: traitScores
            };
        }

        // Ensure we have all required fields
        const finalResults = {
            hollandCode: aiResults.hollandCode || hollandCode,
            dominantTraits: aiResults.dominantTraits || sortedTraits.slice(0, 3),
            scores: aiResults.scores || traitScores,
            completed: true
        };

        return res.status(200).json(finalResults);

    } catch (error) {
        console.error("Error calculating personality:", error);
        return res.status(500).json({ 
            message: "Calculation error", 
            error: error.message,
            stack: error.stack
        });
    }
};

module.exports = {
    getQuestions,
    getUserResponses,
    getQuestionResponses,
    saveBulkAnswers,
    calculateUserPersonality,
};
