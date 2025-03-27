require('dotenv').config();
const mongoose = require('mongoose');
const PersonalityQuestion = require('../models/webapp-models/profilequesModel');

const seedQuestions = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in the .env file.');
        }

        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Clear existing questions
        await PersonalityQuestion.deleteMany({});
        console.log('Cleared existing questions');

        // Define questions grouped by RIASEC traits
        const questionsByTrait = {
            // Realistic (R) – Hands-on, Practical, Manual Work
            Realistic: [
                { question: 'Install flooring in houses', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'R' },
                { question: 'Assemble products in a factory', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'R' },
                { question: 'Fix a broken faucet', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'R' },
                { question: 'Operate a grinding machine in a factory', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'R' },
                { question: 'Assemble electronic parts', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'R' },
                { question: 'Work on an offshore oil-drilling rig', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'R' },
                { question: 'Lay brick or tile', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'R' },
                { question: 'Test the quality of parts before shipment', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'R' },
            ],
            // Investigative (I) – Research, Science, Analytical Thinking
            Investigative: [
                { question: 'Do research on plants or animals', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'I' },
                { question: 'Study animal behavior', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'I' },
                { question: 'Study the structure of the human body', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'I' },
                { question: 'Make a map of the bottom of an ocean', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'I' },
                { question: 'Work in a biology lab', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'I' },
                { question: 'Study whales and other types of marine life', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'I' },
                { question: 'Conduct biological research', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'I' },
                { question: 'Develop a new medical treatment or procedure', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'I' },
            ],
            // Artistic (A) – Creativity, Design, Music, Writing
            Artistic: [
                { question: 'Design sets for plays', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'A' },
                { question: 'Perform stunts for a movie or television show', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'A' },
                { question: 'Play musical instrument', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'A' },
                { question: 'Write books or plays', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'A' },
                { question: 'Write a song', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'A' },
                { question: 'Design artwork for magazines', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'A' },
                { question: 'Direct a play', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'A' },
                { question: 'Conduct a musical choir', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'A' },
            ],
            // Social (S) – Helping, Teaching, Counseling
            Social: [
                { question: 'Teach an individual an exercise routine', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'S' },
                { question: 'Help people who have problems with drugs or alcohol', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'S' },
                { question: 'Do volunteer work at a non-profit organization', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'S' },
                { question: 'Give career guidance to people', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'S' },
                { question: 'Help elderly people with their daily activities', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'S' },
                { question: 'Teach children how to read', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'S' },
                { question: 'Supervise the activities of children at a camp', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'S' },
                { question: 'Help people with family-related problems', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'S' },
            ],
            // Enterprising (E) – Leadership, Business, Sales
            Enterprising: [
                { question: 'Run a toy store', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'E' },
                { question: 'Sell houses', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'E' },
                { question: 'Manage a clothing store', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'E' },
                { question: 'Manage a department within a large company', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'E' },
                { question: 'Operate a beauty salon or barber shop', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'E' },
                { question: 'Manage the operations of a hotel', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'E' },
                { question: 'Sell merchandise at a department store', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'E' },
                { question: 'Sell restaurant franchises to individuals', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'E' },
            ],
            // Conventional (C) – Organization, Data, Record-keeping
            Conventional: [
                { question: 'Generate the monthly payroll checks for an office', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'C' },
                { question: 'Handle customers bank transactions', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'C' },
                { question: 'Operate a calculator', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'C' },
                { question: 'Compute and record statistical and other numerical data', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'C' },
                { question: 'Maintain employee records', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'C' },
                { question: 'Use a computer program to generate customer bills', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'C' },
                { question: 'Inventory supplies using a hand-held computer', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'C' },
                { question: 'Keep shipping and receiving records', responseScale: [1, 2, 3, 4, 5], riasecTrait: 'C' },
            ],
        };

        // Flatten the questions into a single array
        const allQuestions = Object.values(questionsByTrait).flat();

        // Insert questions into the database
        const result = await PersonalityQuestion.insertMany(allQuestions);
        console.log(`${result.length} questions inserted with RIASEC traits`);

        // Verify counts by trait
        const counts = await PersonalityQuestion.aggregate([
            { $group: { _id: "$riasecTrait", count: { $sum: 1 } } }
        ]);
        console.log('Questions by RIASEC trait:', counts);

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding questions:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

seedQuestions();