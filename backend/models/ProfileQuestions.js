const mongoose = require('mongoose');
const PersonalityQuestion = require('./webapp-models/profilequesModel'); // Adjust path as needed

const seedQuestions = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb+srv://adi:1ACiRJq7FsQgFOtV@cluster0.bt8ym8l.mongodb.net/skillnaav-land', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Define the questions to seed
        const questions = [
            { question: 'Do research on plants or animals', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Study animal behaviour', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Study the structure of the human body', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Install flooring in houses', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Assemble products in a factory', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Fix a broken faucet', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Operate a grinding machine in a factory', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Assemble electronic parts', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Work on an offshore oil-drilling rig', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Lay brick or tile', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Test the quality of parts before shipment', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Teach an individual an exercise routine', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Help people who have problems with drugs or alcohol', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Do volunteer work at a non-profit organization', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Give career guidance to people', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Design sets for plays', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Perform stunts for a movie or television show', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Play musical instrument', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Write books or plays', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Write a song', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Design art work for magazines', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Direct a play', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Conduct a musical choir', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Make a map of the bottom of an ocean', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Work in a biology lab', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Study whales and other types of marine life', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Conduct biological research', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Develop a new medical treatment or procedure', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Generate the monthly payroll checks for an office', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Run a toy store', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Sell houses', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Manage a clothing store', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Manage a department within a large company', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Operate a beauty salon or barber shop', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Manage the operations of a hotel', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Sell merchandise at a department store', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Sell restaurant franchises to individuals', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Help elderly people with their daily activities', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Teach children how to read', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Supervise the activities of children at a camp', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Help people with family-related problems', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Handle customers bank transactions', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Operate a calculator', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Compute and record statistical and other numerical data', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Maintain employee records', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Use a computer program to generate customer bills', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Inventory supplies using a hand-held computer', responseScale: [1, 2, 3, 4, 5] },
            { question: 'Keep shipping and receiving records', responseScale: [1, 2, 3, 4, 5] },
        ]; 

        // Insert questions into the database
        const result = await PersonalityQuestion.insertMany(questions);
        console.log('Questions inserted:', result.length);

        // Close the connection
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding questions:', error);
        await mongoose.connection.close();
    }
};

// Run the seeding function
seedQuestions();
