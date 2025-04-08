import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const PartnerGrowthChart = ({ data }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg">
    <h3 className="text-lg font-semibold mb-4">Partner Growth Over Time</h3>
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <CartesianGrid strokeDasharray="3 3" />
        <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default PartnerGrowthChart;
