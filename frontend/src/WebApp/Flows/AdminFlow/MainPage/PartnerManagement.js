import React, { useEffect, useState } from "react";
import axios from "axios";

const PartnerManagement = () => {
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    // Fetch internships from the API
    const fetchInternships = async () => {
      try {
        const response = await axios.get("/api/interns");
        setInternships(response.data);
      } catch (error) {
        console.error("Error fetching internships:", error);
      }
    };

    fetchInternships();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Admin Dashboard - Posted Internships
      </h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Job Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Start Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              End Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stipend/Salary
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {internships.map((internship) => (
            <tr key={internship._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {internship.jobTitle}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {internship.companyName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {internship.location}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {internship.startDate}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {internship.endDateOrDuration}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {internship.stipendOrSalary}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button className="text-green-600 hover:text-green-800">
                  Approve
                </button>
                <button className="ml-4 text-red-600 hover:text-red-800">
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PartnerManagement;
