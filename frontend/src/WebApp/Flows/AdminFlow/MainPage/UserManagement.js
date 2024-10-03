import React, { useState } from "react";

const UserManagement = () => {
  const [internships, setInternships] = useState([
    {
      id: 1,
      title: "Aerospace Internship",
      applicant: "John Doe",
      status: "pending",
    },
    {
      id: 2,
      title: "Aeronautical Internship",
      applicant: "Jane Smith",
      status: "pending",
    },
    {
      id: 3,
      title: "Propulsion Internship",
      applicant: "Alice Johnson",
      status: "pending",
    },
    {
      id: 4,
      title: "Software Engineering Internship",
      applicant: "Mike Brown",
      status: "approved",
    },
    {
      id: 5,
      title: "Data Science Internship",
      applicant: "Emily White",
      status: "rejected",
    },
    {
      id: 6,
      title: "Web Development Internship",
      applicant: "Robert Green",
      status: "pending",
    },
  ]);

  const handleApprove = (id) => {
    setInternships((prevInternships) =>
      prevInternships.map((internship) =>
        internship.id === id
          ? { ...internship, status: "approved" }
          : internship
      )
    );
    console.log(`Approved internship with ID: ${id}`);
  };

  const handleReject = (id) => {
    setInternships((prevInternships) =>
      prevInternships.map((internship) =>
        internship.id === id
          ? { ...internship, status: "rejected" }
          : internship
      )
    );
    console.log(`Rejected internship with ID: ${id}`);
  };

  const handleReview = (id) => {
    console.log(`Reviewing internship with ID: ${id}`);
    // Implement review logic as needed
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Internship Applications
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                S No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Applicant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {internships.map((internship, index) => (
              <tr
                key={internship.id}
                className="hover:bg-gray-50 transition duration-200"
              >
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {internship.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {internship.applicant}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      internship.status === "pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : internship.status === "approved"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {internship.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {internship.status === "pending" ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(internship.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition duration-200 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(internship.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200 text-sm"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleReview(internship.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-200 text-sm"
                      >
                        Review
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">
                      No actions available
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
