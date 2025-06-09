// models/webapp-models/InternshipScheduleModel.js
const mongoose = require('mongoose');

const internshipScheduleSchema = new mongoose.Schema({
  internshipId: { type: mongoose.Schema.Types.ObjectId, required: true },
  partnerId:    { type: mongoose.Schema.Types.ObjectId, required: true },
  startDate:    { type: Date, required: true },
  endDate:      { type: Date, required: true },
  workHours:    { type: String, required: true }, // e.g., "9 AM - 5 PM"

  defaultStartTime:  { type: String },
  defaultEndTime:    { type: String },
  defaultEventLink:  { type: String },
  defaultLocation: {
    name:     { type: String },
    address:  { type: String },
    mapLink:  { type: String }
  },
  defaultType: {
    type: String,
    enum: ['online', 'offline', 'hybrid'],
    default: 'online'
  },
  selectedDays: [{ type: String }], // e.g., ['Monday', 'Wednesday']

  timetable: [
    {
      date:         { type: Date, required: true },
      day:          { type: String, required: true },
      startTime:    { type: String, required: true },
      endTime:      { type: String, required: true },
      eventLink:    { type: String },
      sectionSummary: { type: String },
      instructor:     { type: String },
      assignment:     { type: String }, // optional file URL or filename
      type: {
        type: String,
        enum: ['online', 'offline', 'hybrid'],
        default: 'online'
      },
      location: {
        name:    { type: String },
        address: { type: String },
        mapLink: { type: String }
      },
      events: [
        {
          description: { type: String, required: true },
          type: {
            type: String,
            enum: ['online', 'offline', 'hybrid'],
            default: 'online'
          },
          location: {
            name:    { type: String },
            address: { type: String },
            mapLink: { type: String }
          }
        }
      ]
    }
  ]
}, { timestamps: true });

internshipScheduleSchema.index({ internshipId: 1, partnerId: 1 }, { unique: true });

module.exports = mongoose.model('InternshipSchedule', internshipScheduleSchema);