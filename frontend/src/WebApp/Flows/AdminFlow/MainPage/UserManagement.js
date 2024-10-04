import React, { useState, useEffect } from "react";
import axios from "axios";

const UserManagement = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewingId, setReviewingId] = useState(null); // Track which application is being reviewed

  // Fetch data from the API on component mount
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get("/api/applications"); // Replace with your API endpoint
        setInternships(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleApprove = async (id) => {
    try {
      setLoading(true); // Optionally add loading state
      const response = await axios.patch(`/api/applications/${id}`, {
        status: "approved",
      });

      if (response.status === 200) {
        setInternships((prevInternships) =>
          prevInternships.map((internship) =>
            internship._id === id
              ? { ...internship, status: "approved" }
              : internship
          )
        );
      } else {
        throw new Error("Failed to approve the application.");
      }
    } catch (err) {
      console.error("Error approving application:", err.message);
    } finally {
      setReviewingId(null); // Close the action buttons after action
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.patch(`/api/applications/${id}`, { status: "rejected" });
      setInternships((prevInternships) =>
        prevInternships.map((internship) =>
          internship._id === id
            ? { ...internship, status: "rejected" }
            : internship
        )
      );
      setReviewingId(null); // Close the action buttons after rejecting
    } catch (err) {
      console.error("Error rejecting application:", err.message);
    }
  };

  const handleReview = (id) => {
    if (reviewingId === id) {
      setReviewingId(null); // If already reviewing, toggle it off
    } else {
      setReviewingId(id); // Set the current ID to show action buttons
    }
  };

  if (loading) {
    return <div>Loading applications...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

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
                Company Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Stipend/Salary
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
                key={internship._id}
                className="hover:bg-gray-50 transition duration-200"
              >
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {internship.jobTitle}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {internship.companyName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {internship.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {internship.stipendOrSalary}
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
                    <>
                      {reviewingId === internship._id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(internship._id)}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition duration-200 text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(internship._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200 text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleReview(internship._id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-200 text-sm"
                        >
                          Review
                        </button>
                      )}
                    </>
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
