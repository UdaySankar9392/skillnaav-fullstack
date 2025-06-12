// utils/pdfGenerator.js
const PDFDocument = require("pdfkit");
const moment = require("moment");

const generateOfferPDFBuffer = (offerData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks = [];

    const blue = "#1d4ed8";
    const sectionTitleStyle = () => {
      doc.fillColor(blue).fontSize(12).font("Helvetica-Bold");
    };

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header Section
    doc
      .image("public/Skillnaavlogo.png", 50, 40, { width: 50 })
      .font("Helvetica-Bold")
      .fontSize(20)
      .text((offerData.companyName || "Company Name").toUpperCase(), 110, 50)
      .font("Helvetica")
      .fontSize(10)
      .fillColor("gray")
      .text(offerData.location || "Location", 50, 70, { align: "right" })
      .text(moment().format("MMMM D, YYYY"), 50, 85, { align: "right" })
      .moveTo(50, 100)
      .lineTo(550, 100)
      .stroke();

    // Candidate Info
    doc
      .fontSize(12)
      .fillColor("black")
      .text(`To: ${offerData.name}`, 50, 120)
      .text(`Email: ${offerData.email}`, 50, 135)
      .moveDown();

    // Title
    doc
      .fontSize(16)
      .fillColor(blue)
      .text(`OFFER LETTER – ${offerData.position?.toUpperCase()}`, {
        underline: true,
      })
      .moveDown(1);

    // Body Text
    doc
      .fontSize(12)
      .fillColor("black")
      .text(
        `Dear ${offerData.name},`,
        { continued: false }
      )
      .moveDown(0.5)
      .text(
        `We are delighted to offer you the position of ${offerData.position} at ${offerData.companyName}. Your internship is scheduled to commence on ${moment(offerData.startDate).format("MMMM D, YYYY")}.`,
        { align: "justify" }
      )
      .moveDown();

    // Position Details
    sectionTitleStyle();
    doc.text("POSITION DETAILS").moveDown(0.3);
    doc.font("Helvetica").fillColor("black");
    doc
      .text(`• Job Title: ${offerData.position}`, { indent: 30 })
      .text(`• Reporting Manager: ${offerData.contactInfo?.name || "To be assigned"}`, { indent: 30 })
      .text(`• Location: ${offerData.location}`, { indent: 30 })
      .text(`• Start Date: ${moment(offerData.startDate).format("MMMM D, YYYY")}`, { indent: 30 })
      .text(`• Duration: ${offerData.duration}`, { indent: 30 })
      .moveDown();

    // Compensation
    sectionTitleStyle();
    doc.text("COMPENSATION DETAILS").moveDown(0.3);
    doc.font("Helvetica").fillColor("black");

    const comp = offerData.compensationDetails;
    if (offerData.internshipType === "STIPEND") {
      doc.text(`• Stipend: ${comp.amount} ${comp.currency} per ${comp.frequency.toLowerCase()}`, { indent: 30 });
      if (comp.benefits?.length > 0) {
        doc.text(`• Additional Benefits:`, { indent: 30 });
        comp.benefits.forEach((b) => doc.text(`  - ${b}`, { indent: 45 }));
      }
    } else if (offerData.internshipType === "PAID") {
      doc.text(`• This is a paid internship.`, { indent: 30 });
      comp.additionalCosts?.forEach((cost) => {
        doc.text(`  - ${cost.description}: ${cost.amount} ${cost.currency}`, { indent: 45 });
      });
    } else {
      doc.text(`• This is an unpaid internship.`, { indent: 30 });
    }
    doc.moveDown();

    // Responsibilities
    if (offerData.jobDescription) {
      sectionTitleStyle();
      doc.text("KEY RESPONSIBILITIES").moveDown(0.3);
      doc.font("Helvetica").fillColor("black");
      offerData.jobDescription.split("\n").forEach((item) => {
        if (item.trim()) doc.text(`• ${item.trim()}`, { indent: 30 });
      });
      doc.moveDown();
    }

    // Qualifications
    if (offerData.qualifications?.length) {
      sectionTitleStyle();
      doc.text("REQUIRED QUALIFICATIONS").moveDown(0.3);
      doc.font("Helvetica").fillColor("black");
      offerData.qualifications.forEach((q) => {
        doc.text(`• ${q}`, { indent: 30 });
      });
      doc.moveDown();
    }

    // Terms
    sectionTitleStyle();
    doc.text("TERMS AND CONDITIONS").moveDown(0.3);
    doc.font("Helvetica").fillColor("black")
      .text(`1. This offer is contingent upon successful completion of any pre-internship requirements.`, { indent: 30 })
      .text(`2. Interns are expected to adhere to all company policies.`, { indent: 30 })
      .text(`3. The internship may be terminated by either party with ${offerData.noticePeriod || "2 weeks"} notice.`, { indent: 30 })
      .moveDown();

    // Acceptance
    sectionTitleStyle();
    doc.text("ACCEPTANCE").moveDown(0.3);
    doc.font("Helvetica").fillColor("black")
      .text(`Please sign and return this offer letter by ${moment().add(7, "days").format("MMMM D, YYYY")} to confirm your acceptance.`, { indent: 0 })
      .moveDown(2)
      .text(`We look forward to welcoming you aboard!`)
      .moveDown(3)
      .text(`Sincerely,`)
      .moveDown()
      .text(`___________________________`)
      .text(offerData.contactInfo?.name || "HR Manager")
      .text(offerData.companyName)
      .text(`Email: ${offerData.contactInfo?.email || "hr@company.com"}`)
      .text(`Phone: ${offerData.contactInfo?.phone || ""}`);

    doc.end();
  });
};

module.exports = generateOfferPDFBuffer;
