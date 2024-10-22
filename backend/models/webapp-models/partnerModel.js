const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    universityName: { type: String, required: true },
    institutionId: { type: String, required: true },
    // Add any other fields you need
}, {
    collection: 'partnerReg' // Specify the collection name here
});

const Partner = mongoose.model('Partner', partnerSchema);

module.exports = Partner;
