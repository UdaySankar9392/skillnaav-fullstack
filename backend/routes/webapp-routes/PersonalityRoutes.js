const express = require('express');
const router = express.Router();
const personalityController = require('../../controllers/personalityController');

// Get all active questions
router.get('/questions', personalityController.getQuestions);

// Get all responses for a specific user
// Changed this route to handle query parameters instead of a URL parameter
router.get('/responses', personalityController.getUserResponses);

// Get all responses for a specific question
router.get('/responses/question/:questionId', personalityController.getQuestionResponses);

// Save bulk answers
router.post('/responses/bulk', personalityController.saveBulkAnswers);

module.exports = router;
