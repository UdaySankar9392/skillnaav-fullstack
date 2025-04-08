const express = require("express");
const { getDashboardCounts } = require("../../controllers/dashboardController");
const router = express.Router();

// Endpoint to fetch counts for dashboard metrics
router.get("/counts", getDashboardCounts);

module.exports = router;
