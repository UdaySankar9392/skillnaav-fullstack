const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Userwebapp", 
    required: true 
  },
  internshipId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "InternshipPosting", 
    required: true 
  },
  resumeUrl: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["Applied", "Under Review", "Accepted", "Rejected", "Viewed", "Pending"], 
    default: "Applied" 
  },
  appliedDate: { 
    type: Date, 
    default: Date.now 
  },
  // Populating user details for convenience (optional if you want them in the application itself)
  userName: { 
    type: String, 
    required: true
  },
  userEmail: { 
    type: String, 
    required: true
  },
  jobTitle: { 
    type: String, 
    required: true
  },
  
});

// Model for Application
const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
