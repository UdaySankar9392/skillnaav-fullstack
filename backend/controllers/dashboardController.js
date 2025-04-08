const asyncHandler = require("express-async-handler");
const Userwebapp = require("../models/webapp-models/userModel");
const Partnerwebapp = require("../models/webapp-models/partnerModel");
const InternshipModel = require("../models/webapp-models/internshipPostModel");
const PaymentModel = require("../models/webapp-models/PaymentModel");
const ApplicationModel = require("../models/webapp-models/applicationModel");

// Helper function to get month name from number
const getMonthName = (monthNumber) => {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString("default", { month: "short" });
};

const getDashboardCounts = asyncHandler(async (req, res) => {
  // Basic counts
  const usersCount = await Userwebapp.countDocuments({});
  const partnersCount = await Partnerwebapp.countDocuments({});
  const paymentsCount = await PaymentModel.countDocuments({});
  const internshipsCount = await InternshipModel.countDocuments({});
  const applicationsCount = await ApplicationModel.countDocuments({}); // Total applications

  // 🔹 Total Revenue Calculation
  const totalRevenueAgg = await PaymentModel.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: { $toDouble: "$amount" } } // Convert amount to number
      }
    }
  ]);
  const totalRevenue = totalRevenueAgg.length > 0 ? totalRevenueAgg[0].totalRevenue : 0;

  const monthlyRevenueAgg = await PaymentModel.aggregate([
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        totalRevenue: { $sum: { $toDouble: "$amount" } } // Convert amount to number
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);
  
  const monthlyRevenue = monthlyRevenueAgg.map(entry => ({
    month: `${getMonthName(entry._id.month)} ${entry._id.year}`,
    revenue: entry.totalRevenue
  }));
  

  // Aggregate User Growth data by month
  const userGrowthAgg = await Userwebapp.aggregate([
    { $group: { _id: { $month: "$createdAt" }, users: { $sum: 1 } } },
    { $sort: { "_id": 1 } }
  ]);
  const userGrowth = userGrowthAgg.map(item => ({
    month: getMonthName(item._id),
    users: item.users
  }));

  // Aggregate Monthly Job Postings
  const jobPostingsAgg = await InternshipModel.aggregate([
    { $group: { _id: { $month: "$createdAt" }, jobsPosted: { $sum: 1 } } },
    { $sort: { "_id": 1 } }
  ]);
  const jobPostings = jobPostingsAgg.map(item => ({
    month: getMonthName(item._id),
    jobsPosted: item.jobsPosted
  }));

  // Internship Type Distribution
  const internshipTypeAgg = await InternshipModel.aggregate([
    { $group: { _id: "$internshipType", count: { $sum: 1 } } }
  ]);
  const internshipTypeDistribution = internshipTypeAgg.reduce((acc, cur) => {
    acc[cur._id] = cur.count;
    return acc;
  }, {});

  // Average Compensation
  const avgCompensationAgg = await InternshipModel.aggregate([
    { $match: { "compensationDetails.type": { $in: ["STIPEND", "PAID"] } } },
    { $group: { _id: "$compensationDetails.type", avgAmount: { $avg: "$compensationDetails.amount" } } }
  ]);
  const averageCompensation = avgCompensationAgg.reduce((acc, cur) => {
    acc[cur._id] = cur.avgAmount;
    return acc;
  }, {});

  // Partner Approval Status
  const partnerApprovalAgg = await Partnerwebapp.aggregate([
    { $group: { _id: "$adminApproved", count: { $sum: 1 } } }
  ]);
  const partnerApproval = partnerApprovalAgg.reduce((acc, cur) => {
    acc[cur._id ? "approved" : "pending"] = cur.count;
    return acc;
  }, {});

  // Monthly Partner Growth Trend
  const partnerGrowthAgg = await Partnerwebapp.aggregate([
    { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
    { $sort: { "_id": 1 } }
  ]);
  const partnerGrowth = partnerGrowthAgg.map(item => ({
    month: getMonthName(item._id),
    count: item.count
  }));

  // **New Analytics: Application Status Distribution**
  const applicationStatusAgg = await ApplicationModel.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  const applicationStatusDistribution = applicationStatusAgg.reduce((acc, cur) => {
    acc[cur._id] = cur.count;
    return acc;
  }, {});

  // **New Analytics: Applications by Internship Type (STIPEND, PAID, FREE)**
  const applicationsByInternshipType = await ApplicationModel.aggregate([
    {
      $lookup: {
        from: "internshippostings", // Ensure the collection name is correct
        localField: "internshipId",
        foreignField: "_id",
        as: "internshipDetails"
      }
    },
    { $unwind: "$internshipDetails" },
    {
      $group: {
        _id: "$internshipDetails.internshipType",
        count: { $sum: 1 }
      }
    }
  ]);

  const applicationTypeDistribution = applicationsByInternshipType.reduce((acc, cur) => {
    acc[cur._id] = cur.count;
    return acc;
  }, {});

  res.json({
    usersCount,
    partnersCount,
    internshipsCount,
    paymentsCount,
    applicationsCount, // Total applications
    userGrowth,      
    jobPostings,     
    internshipTypeDistribution,
    averageCompensation,         
    partnerApproval,             
    partnerGrowth,               
    applicationStatusDistribution, // Application type breakdown
    applicationTypeDistribution, // New: Applications applied by type (STIPEND, PAID, FREE)
    totalRevenue,
    monthlyRevenue
  });
});

module.exports = { getDashboardCounts };
