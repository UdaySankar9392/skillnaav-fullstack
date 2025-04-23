const path = require('path');
const fs = require('fs');
const generateOfferPDFBuffer = require('../utils/pdfGenerator');
const { uploadOfferLetterBuffer } = require('../utils/multer');
const OfferLetter = require('../models/webapp-models/offerLetterModel');

const sendOfferLetter = async (req, res) => {
  try {
    const { studentId, name, email, position, startDate, internshipId } = req.body;

    // Enhanced validation
    const requiredFields = ['studentId', 'name', 'email', 'position', 'startDate'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        missing: missingFields
      });
    }

    // Generate PDF with more data
    const pdfBuffer = await generateOfferPDFBuffer({
      name,
      position,
      startDate,
      // Add these if available
      internshipId,
      // ...(internshipId && { internshipDetails: await getInternshipDetails(internshipId) })
    });

    // Upload to S3 with better filename
    const fileName = `offer-${studentId}-${Date.now()}.pdf`;
    const s3Url = await uploadOfferLetterBuffer(pdfBuffer, fileName);

    // Create database record
    const offerLetter = await OfferLetter.create({
      studentId,
      name,
      email,
      position,
      startDate, // ✅ Use the correct schema field
      s3Url,
      status: "Sent",
      ...(internshipId && { internshipId })
    });
    

    res.status(201).json({
      message: 'Offer letter sent successfully',
      offerLetter: {
        _id: offerLetter._id,
        studentId: offerLetter.studentId,
        position: offerLetter.position,
        joiningDate: offerLetter.joiningDate,
        downloadUrl: s3Url
      }
    });

  } catch (err) {
    console.error('Offer Letter Error:', err);
    const errorResponse = {
      error: err.message || 'Failed to process offer letter',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };
    res.status(500).json(errorResponse);
  }
};

module.exports = {
  sendOfferLetter
};