const express = require("express");
const router = express.Router();
const {
  getTemplatesByPartner,
  createTemplate,
} = require("../../controllers/offerTemplateController");

router.get("/", getTemplatesByPartner);     // GET /api/templates?partnerId=xxx
router.post("/", createTemplate);           // POST /api/templates

module.exports = router;
