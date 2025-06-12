const OfferTemplate = require("../models/webapp-models/OfferTemplateModel");

exports.getTemplatesByPartner = async (req, res) => {
  try {
    const { partnerId } = req.query;
    if (!partnerId) {
      return res.status(400).json({ error: "partnerId is required" });
    }

    const templates = await OfferTemplate.find({ partnerId });
    res.status(200).json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const { partnerId, title, content } = req.body;

    if (!partnerId || !title || !content) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const template = await OfferTemplate.create({ partnerId, title, content });
    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
