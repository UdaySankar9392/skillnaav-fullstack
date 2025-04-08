import React, { useState, useEffect } from "react";
import { FaUsers, FaUserFriends, FaBriefcase, FaDollarSign } from "react-icons/fa";
import DashboardCharts from "./Analytics/DashboardCharts";
import InternshipTypeChart from "./Analytics/InternshipTypeChart";
import AverageCompensationChart from "./Analytics/AverageCompensationChart";
import PartnerApprovalChart from "./Analytics/PartnerApprovalChart";
import PartnerGrowthChart from "./Analytics/PartnerGrowthChart";
import ApplicationsByTypeChart from "./Analytics/ApplicationsByTypeChart"; // Import the new chart
import RevenueChart from "./Analytics/RevenueChart"; // Import the new revenue chart
import Card from "./Analytics/Card";

const Dashboard = () => {
  const [data, setData] = useState({
    partnersCount: 0,
    activeUsersCount: 0,
    internshipsCount: 0,
    paymentsCount: 0,
    jobApplications: 0,
    internshipApprovals: 0,
    internshipRejections: 0,
    userGrowth: [],
    jobPostings: [],
    internshipTypeDistribution: {},
    averageCompensation: {},
    partnerApproval: {},
    partnerGrowth: [],
    applicationTypeDistribution: {},
    totalRevenue: 0, // Add totalRevenue state
    monthlyRevenue: [],
  });
  

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard/counts");
      const jsonData = await response.json();
      setData({
        partnersCount: jsonData.partnersCount,
        activeUsersCount: jsonData.usersCount || 0,
        internshipsCount: jsonData.internshipsCount || 0,
        paymentsCount: jsonData.paymentsCount || 0,
        jobApplications: jsonData.jobApplications || 0,
        internshipApprovals: jsonData.internshipApprovals || 0,
        internshipRejections: jsonData.internshipRejections || 0,
        userGrowth: jsonData.userGrowth || [],
        jobPostings: jsonData.jobPostings || [],
        internshipTypeDistribution: jsonData.internshipTypeDistribution || {},
        averageCompensation: jsonData.averageCompensation || {},
        partnerApproval: jsonData.partnerApproval || {},
        partnerGrowth: jsonData.partnerGrowth || [],
        applicationTypeDistribution: jsonData.applicationTypeDistribution || {},
        totalRevenue: jsonData.totalRevenue || 0, // Fetch total revenue
        monthlyRevenue: jsonData.monthlyRevenue || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };


  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">Admin Analytics</h2>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card
          icon={<FaUserFriends className="h-8 w-8 text-blue-600" />}
          title="Partners Enrolled"
          count={data.partnersCount}
          color="bg-blue-100"
        />
        <Card
          icon={<FaUsers className="h-8 w-8 text-green-600" />}
          title="Active Users"
          count={data.activeUsersCount}
          color="bg-green-100"
        />
        <Card
          icon={<FaBriefcase className="h-8 w-8 text-yellow-600" />}
          title="Total Internships"
          count={data.internshipsCount}
          color="bg-yellow-100"
        />
        <Card
          icon={<FaDollarSign className="h-8 w-8 text-red-600" />}
          title="Total Payments"
          count={data.paymentsCount}
          color="bg-red-100"
        />
      </div>

      {/* Existing Charts Section */}
      <DashboardCharts userGrowth={data.userGrowth} jobPostings={data.jobPostings} />

      {/* New Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Internship Type Distribution */}
        <InternshipTypeChart distribution={data.internshipTypeDistribution} />

        {/* Average Compensation Chart */}
        <AverageCompensationChart data={data.averageCompensation} />
      </div>

      {/* Additional Analytics: Partner Approval & Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Partner Approval Chart */}
        <PartnerApprovalChart data={data.partnerApproval} />

        {/* Partner Growth Chart */}
        <PartnerGrowthChart data={data.partnerGrowth} />
      </div>

      {/* New: Applications by Type (STIPEND, PAID, FREE) */}
      <div className="mt-8">
        <ApplicationsByTypeChart data={data.applicationTypeDistribution} />
      </div>

      {/* New Revenue Analytics Section */}
      <div className="mt-8">
        <RevenueChart data={data.monthlyRevenue} />
      </div>
    </div>
  );
};

export default Dashboard;
