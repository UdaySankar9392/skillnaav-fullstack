// utils/pdfGenerator.js
const PDFDocument = require('pdfkit');
const moment = require('moment');

const generateOfferPDFBuffer = (offerData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    
    // Helper function for section headers
    const addSectionHeader = (text, y) => {
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .fillColor('#2c3e50')
         .text(text, 50, y);
      doc.moveDown(0.5);
    };

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header Section
    doc.image('public/Skillnaavlogo.png', 50, 45, { width: 50 })
    .fillColor('#2c3e50')
    .fontSize(20)
    .text((offerData.companyName || 'COMPANY NAME').toUpperCase(), 110, 57)
    .fontSize(10)
    .text(offerData.location || 'Location', 200, 65, { align: 'right' })
    .text(moment().format('MMMM D, YYYY'), 200, 80, { align: 'right' })
    .moveTo(50, 100).lineTo(550, 100).stroke();
 

    // Candidate Information
    doc.fontSize(12)
       .text(`To: ${offerData.name}`, 50, 120)
       .text(`Email: ${offerData.email}`, 50, 135);

    // Offer Title
    doc.fontSize(16)
       .fillColor('#3498db')
       .text(`OFFER LETTER - ${offerData.position.toUpperCase()}`, 50, 170, { underline: true });

    // Salutation
    doc.fontSize(12)
       .fillColor('#000000')
       .text(`Dear ${offerData.name},`, 50, 210)
       .moveDown(0.5)
       .text(`We are pleased to offer you the position of ${offerData.position} at ${offerData.companyName}, starting on ${moment(offerData.startDate).format('MMMM D, YYYY')}.`, { align: 'justify' })
       .moveDown();

    // Position Details Section
    addSectionHeader('POSITION DETAILS', doc.y);
    doc.font('Helvetica')
       .text(`• Job Title: ${offerData.position}`, { indent: 30 })
       .text(`• Department: ${offerData.department || 'To be determined'}`, { indent: 30 })
       .text(`• Reporting Manager: ${offerData.contactInfo?.name || 'To be assigned'}`, { indent: 30 })
       .text(`• Location: ${offerData.location}`, { indent: 30 })
       .text(`• Start Date: ${moment(offerData.startDate).format('MMMM D, YYYY')}`, { indent: 30 })
       .text(`• Duration: ${offerData.duration}`, { indent: 30 })
       .moveDown();

    // Compensation Section
    addSectionHeader('COMPENSATION DETAILS', doc.y);
    if (offerData.internshipType === 'STIPEND') {
      doc.font('Helvetica')
         .text(`• Stipend: ${offerData.compensationDetails.amount} ${offerData.compensationDetails.currency} per ${offerData.compensationDetails.frequency.toLowerCase()}`, { indent: 30 });
      
      if (offerData.compensationDetails.benefits?.length > 0) {
        doc.text(`• Additional Benefits:`, { indent: 30 });
        offerData.compensationDetails.benefits.forEach(benefit => {
          doc.text(`  - ${benefit}`, { indent: 45 });
        });
      }
    } else if (offerData.internshipType === 'PAID') {
      doc.text(`• This is a paid internship with the following cost structure:`, { indent: 30 });
      offerData.compensationDetails.additionalCosts?.forEach(cost => {
        doc.text(`  - ${cost.description}: ${cost.amount} ${cost.currency}`, { indent: 45 });
      });
    } else {
      doc.text(`• This is an unpaid internship opportunity`, { indent: 30 });
    }
    doc.moveDown();

    // Responsibilities Section
    if (offerData.jobDescription) {
      addSectionHeader('KEY RESPONSIBILITIES', doc.y);
      const responsibilities = offerData.jobDescription.split('\n').filter(item => item.trim());
      responsibilities.forEach(resp => {
        doc.text(`• ${resp.trim()}`, { indent: 30 });
      });
      doc.moveDown();
    }

    // Qualifications Section
    if (offerData.qualifications?.length > 0) {
      addSectionHeader('REQUIRED QUALIFICATIONS', doc.y);
      offerData.qualifications.forEach(qual => {
        doc.text(`• ${qual}`, { indent: 30 });
      });
      doc.moveDown();
    }

    // Terms and Conditions
    addSectionHeader('TERMS AND CONDITIONS', doc.y);
    doc.text(`1. This offer is contingent upon successful completion of any pre-employment requirements.`, { indent: 30 })
       .text(`2. You will be required to comply with all company policies and procedures.`, { indent: 30 })
       .text(`3. The internship may be terminated by either party with ${offerData.noticePeriod || '2 weeks'} notice.`, { indent: 30 })
       .moveDown();

    // Acceptance Section
    addSectionHeader('ACCEPTANCE', doc.y);
    doc.text(`Please sign and return this letter by ${moment().add(7, 'days').format('MMMM D, YYYY')} to indicate your acceptance of this offer.`)
       .moveDown(2)
       .text(`We look forward to you joining our team.`)
       .moveDown(3)
       .text(`Sincerely,`)
       .moveDown(1)
       .text(`___________________________`)
       .text(offerData.contactInfo?.name || 'Hiring Manager')
       .text(offerData.companyName)
       .text(`Email: ${offerData.contactInfo?.email || 'hr@company.com'}`)
       .text(`Phone: ${offerData.contactInfo?.phone || ''}`);

    doc.end();
  });
};

module.exports = generateOfferPDFBuffer;