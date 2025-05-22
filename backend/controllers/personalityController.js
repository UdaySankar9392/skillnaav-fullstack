const mongoose = require('mongoose');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config();

const PersonalityResponse = require('../models/webapp-models/personalityModel');
const PersonalityQuestion = require('../models/webapp-models/profilequesModel');

// Map from response text to points
const responseMap = {
  Dislike: 1,
  'Slightly Dislike': 2,
  Neutral: 3,
  'Slightly Enjoy': 4,
  Enjoy: 5,
};

// Initialize Bedrock client with your AWS creds
const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// GET all active questions
const getQuestions = async (req, res) => {
  try {
    const questions = await PersonalityQuestion.find({ isActive: true });
    return questions.length
      ? res.status(200).json(questions)
      : res.status(404).json({ message: 'No active questions found' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error fetching questions' });
  }
};

// GET user responses
const getUserResponses = async (req, res) => {
  try {
    const { userId } = req.query;
    const responses = await PersonalityResponse.find({ userId })
      .populate('questionId', 'question')
      .exec();
    return res.status(200).json(responses || []);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error fetching responses' });
  }
};

// GET responses for one question
const getQuestionResponses = async (req, res) => {
  try {
    const responses = await PersonalityResponse.find({ questionId: req.params.questionId });
    return responses.length
      ? res.status(200).json(responses)
      : res.status(404).json({ message: 'No responses for that question' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error fetching question responses' });
  }
};

// POST bulk answers
const saveBulkAnswers = async (req, res) => {
  try {
    if (!Array.isArray(req.body.responses)) {
      return res.status(400).json({ error: 'Invalid format' });
    }
    const docs = req.body.responses.map((r) => {
      if (!r.questionId || !r.userId || !r.response) {
        throw new Error('Missing fields in response');
      }
      const pts = r.points || responseMap[r.response];
      if (!pts || pts < 1 || pts > 5) {
        throw new Error(`Invalid points for ${r.response}`);
      }
      return { questionId: r.questionId, userId: r.userId, response: r.response, points: pts };
    });
    await PersonalityResponse.insertMany(docs);
    return res.status(201).json({ message: 'Saved bulk answers' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};

// GET calculate personality via LLaMA on Bedrock
const calculateUserPersonality = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid or missing userId' });
    }

    const responses = await PersonalityResponse.find({ userId }).populate('questionId').exec();
    if (!responses.length) {
      return res.status(404).json({ message: 'No responses found' });
    }

    // locally compute trait scores
    const traitScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    responses.forEach((r) => {
      const t = r.questionId.riasecTrait;
      if (t && traitScores.hasOwnProperty(t)) traitScores[t] += r.points;
    });
    const sorted = Object.entries(traitScores).sort((a, b) => b[1] - a[1]).map(([t]) => t);
    const hollandCode = sorted.slice(0, 3).join('');

    const summary = responses.map((r) => ({
      question: r.questionId.question,
      trait: r.questionId.riasecTrait,
      response: r.response,
      points: r.points,
    }));

    const prompt = `
You are a psychology expert on RIASEC assessments.
Responses:
${JSON.stringify(summary, null, 2)}
Scores:
${JSON.stringify(traitScores, null, 2)}
Return JSON:
{
  "hollandCode":"ABC",
  "dominantTraits":["A","B","C"],
  "scores":{ "R":0,"I":0,"A":0,"S":0,"E":0,"C":0 }
}`;

    // invoke Bedrock
    const command = new InvokeModelCommand({
      modelId: 'meta.llama3-8b-instruct-v1',// your Bedrock LLaMA model identifier
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        prompt,
        max_gen_len: 1024,
        temperature: 0.3,
      }),
    });

    let aiResults;
    try {
      const resp = await bedrock.send(command);
      const bodyStr = Buffer.from(resp.body).toString('utf8');
      const parsed = JSON.parse(bodyStr);
      // If your model returns { completion: "…JSON…"}
      aiResults = JSON.parse(parsed.completion || parsed.choices?.[0]?.text);
    } catch (e) {
      console.warn('Bedrock call failed, falling back to local:', e);
      aiResults = {
        hollandCode,
        dominantTraits: sorted.slice(0, 3),
        scores: traitScores,
      };
    }

    return res.status(200).json({
      hollandCode: aiResults.hollandCode || hollandCode,
      dominantTraits: aiResults.dominantTraits || sorted.slice(0, 3),
      scores: aiResults.scores || traitScores,
      completed: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Calculation error', error: err.message, stack: err.stack });
  }
};

module.exports = {
  getQuestions,
  getUserResponses,
  getQuestionResponses,
  saveBulkAnswers,
  calculateUserPersonality,
};
