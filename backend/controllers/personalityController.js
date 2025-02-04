const PersonalityResponse = require('../models/webapp-models/personalityModel'); // Correct model path
const PersonalityQuestion = require('../models/webapp-models/profilequesModel'); // Import the model
const mongoose = require('mongoose');

// Post responses for a user
// const postResponse = async (req, res) => {
//     try {
//         const { userId, questionId, response } = req.body;

//         const existingResponse = await PersonalityResponse.findOne({ userId, questionId });

//         if (existingResponse) {
//             existingResponse.response = response;
//             await existingResponse.save();
//         } else {
//             const newResponse = new PersonalityResponse({ userId, questionId, response });
//             await newResponse.save();
//         }

//         res.status(201).json({ success: true, message: "Response saved successfully" });
//     } catch (error) {
//         console.error("Error saving response:", error);
//         res.status(500).json({ success: false, message: "Internal server error" });
//     }
// };

// Get all questions
const getQuestions = async (req, res) => {
    try {
        const questions = await PersonalityQuestion.find({});  // Adjust query if you need to filter active questions
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
            .populate('questionId', 'question') // Populate the question text
            .exec();

        if (!responses.length) {
            return res.status(200).json([]); // Return empty array if no responses
        }

        res.status(200).json(responses); // Send responses with question data
    } catch (error) {
        console.error("Error fetching responses:", error);
        res.status(500).json({ message: "Error fetching responses", error });
    }
};


  
  
// Get responses for a specific question
const getQuestionResponses = async (req, res) => {
    try {
        const questionId = req.params.questionId;

        const responses = await PersonalityResponse.find({ questionId });  // Fixed the incorrect model name `UserResponse` to `PersonalityResponse`

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
        console.log("Incoming bulk responses:", req.body); // Debugging

        const { responses, userId } = req.body;

        // Validate userId
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid or missing userId" });
        }

        // Validate responses array
        if (!Array.isArray(responses) || responses.length === 0) {
            return res.status(400).json({ success: false, message: "No responses provided" });
        }

        // Validate DB Connection
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ success: false, message: "Database connection error" });
        }

        // Validate & Format Responses
        const formattedResponses = responses.map(resp => {
            if (!resp.questionId || !mongoose.Types.ObjectId.isValid(resp.questionId)) {
                throw new Error(`Invalid questionId: ${resp.questionId}`);
            }
            return {
                questionId: new mongoose.Types.ObjectId(resp.questionId),
                response: String(resp.response),
                userId: new mongoose.Types.ObjectId(userId),
                points: resp.points || 0,
                status: "active",
            };
        });

        const savedResponses = await PersonalityResponse.insertMany(formattedResponses);

        res.status(201).json({
            success: true,
            message: "Responses saved successfully",
            data: savedResponses,
        });
    } catch (error) {
        console.error("Error saving bulk answers:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save responses",
            error: error.message,
        });
    }
};


module.exports = {
    // postResponse,
    getQuestions,
    getUserResponses,
    getQuestionResponses,
    saveBulkAnswers,
};
