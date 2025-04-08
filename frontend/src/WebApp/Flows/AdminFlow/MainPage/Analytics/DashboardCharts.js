import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const DashboardCharts = ({ userGrowth, jobPostings }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
    {/* Line Chart for User Growth */}
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">User Growth Over Time</h3>
      <LineChart width={400} height={250} data={userGrowth}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <CartesianGrid strokeDasharray="3 3" />
        <Line type="monotone" dataKey="users" stroke="#4CAF50" strokeWidth={2} />
      </LineChart>
    </div>

    {/* Bar Chart for Job Postings */}
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Monthly Job Postings</h3>
      <BarChart width={400} height={250} data={jobPostings}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <CartesianGrid strokeDasharray="3 3" />
        <Bar dataKey="jobsPosted" fill="#2196F3" />
      </BarChart>
    </div>
  </div>
);

export default DashboardCharts;
