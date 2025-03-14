import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faClock, faDollarSign } from "@fortawesome/free-solid-svg-icons";

const InternshipList = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState({});

  const partnerId = localStorage.getItem("partnerId");

  // Fetch internships posted by the partner
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        if (partnerId) {
          const response = await axios.get(`/api/interns/partner/${partnerId}`);
          console.log("Fetched internships:", response.data);
          setInternships(response.data);
        } else {
          setError("Partner ID not found");
        }
      } catch (err) {
        setError("No internships posted by partner");
        console.error("Error fetching internships:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, [partnerId]);

  // Fetch applications for a specific internship
  const fetchApplications = async (internshipId) => {
    try {
      const response = await axios.get(`/api/applications/internship/${internshipId}`);
      setApplications((prev) => ({
        ...prev,
        [internshipId]: response.data.applications,
      }));
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  // Function to calculate the posted time
  const calculateDaysAgo = (date) => {
    const postedDate = new Date(date);
    const currentDate = new Date();
    const differenceInTime = currentDate - postedDate; // Difference in milliseconds
    const differenceInHours = Math.floor(differenceInTime / (1000 * 60 * 60)); // Convert to hours
    const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24)); // Convert to days

    if (differenceInDays === 0) {
      return differenceInHours === 0
        ? "Just now"
        : differenceInHours === 1
          ? "1 hour ago"
          : `${differenceInHours} hours ago`;
    } else if (differenceInDays === 1) {
      return "Yesterday";
    } else {
      return `${differenceInDays}d ago`;
    }
  };

  // Update application status
  const updateApplicationStatus = async (internshipId, studentId, status) => {
    try {
      const response = await axios.put(`/api/applications/${studentId}/status`, {
        status,
      });
      setApplications((prev) => ({
        ...prev,
        [internshipId]: prev[internshipId].map((student) =>
          student._id === studentId ? { ...student, status } : student
        ),
      }));
      console.log("Application status updated:", response.data);
    } catch (err) {
      console.error("Error updating application status:", err);
    }
  };

  if (loading) return <div className="text-center text-lg text-gray-700">Loading internships...</div>;
  if (error) return <div className="text-center text-lg text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Internships Posted by Partner</h2>

      {internships.length > 0 ? (
        internships.map((internship) => (
          <div
            key={internship._id}
            className="mb-6 p-6 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition duration-300 ease-in-out"
          >
            {/* Job Image and Company Info */}
            <div className="flex items-center mb-4">

              <img
                src={internship.imgUrl || "https://via.placeholder.com/150"}
                alt={internship.companyName}
                className="w-16 h-16 rounded-full mr-4"
              />
              <div>
                <h3 className="text-xl font-semibold">{internship.jobTitle}</h3>
                <p className="text-gray-600">
                  {internship.companyName} • {calculateDaysAgo(internship.createdAt)}
                </p>
              </div>
            </div>

  <img
    src={internship.imgUrl || "https://via.placeholder.com/150"}
    alt={internship.companyName}
    className="w-16 h-16 rounded-full mr-4"
  />
  <div>
    <h3 className="text-xl font-semibold">{internship.jobTitle}</h3>
    <p className="text-gray-600">
      {internship.companyName} • {calculateDaysAgo(internship.createdAt)}
    </p>
  </div>
</div>




            {/* Job Details */}
            <div className="text-gray-600 mb-4">
              <p className="flex items-center mb-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" /> {internship.location} • {internship.jobType}
              </p>
              <p className="flex items-center mb-2">
                <FontAwesomeIcon icon={faClock} className="mr-2" />{" "}
                {new Date(internship.startDate).toLocaleDateString()} - {internship.endDateOrDuration}
              </p>
              <p className="flex items-center mb-2">
                <FontAwesomeIcon icon={faDollarSign} className="mr-2" /> {internship.internshipType === "STIPEND"
                  ? `${internship.compensationDetails?.amount} ${internship.compensationDetails?.currency} per ${internship.compensationDetails?.frequency?.toLowerCase()}`
                  : internship.internshipType === "FREE"
                    ? "Unpaid / Free"
                    : internship.internshipType === "PAID"
                      ? `Student Pays: ${internship.compensationDetails?.amount} ${internship.compensationDetails?.currency}`
                      : "N/A"
                }
              </p>
            </div>

            {/* Fetch Applications Button */}
            <button
              onClick={() => fetchApplications(internship._id)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Applications
            </button>

            {/* Applied Students Section */}
            <div className="text-gray-700 mt-6">
              <h4 className="text-xl font-semibold">Applied Students:</h4>
              {applications[internship._id] ? (
                applications[internship._id].length > 0 ? (
                  <div className="overflow-x-auto mt-4">
                    <table className="min-w-full table-auto">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="px-4 py-2 text-left">Username</th>
                          <th className="px-4 py-2 text-left">Email</th>
                          <th className="px-4 py-2 text-left">Applied Date</th>
                          <th className="px-4 py-2 text-left">Resume</th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-left">Update Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications[internship._id].map((student) => (
                          <tr key={student._id}>
                            <td className="px-4 py-2">{student.userName}</td>
                            <td className="px-4 py-2">{student.userEmail}</td>
                            <td className="px-4 py-2">{new Date(student.appliedDate).toLocaleDateString()}</td>
                            <td className="px-4 py-2">
                              <a
                                href={student.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 underline"
                              >
                                View Resume
                              </a>
                            </td>

                            <td className="px-4 py-2">{student.status || "Pending"}</td>
                            <td className="px-4 py-2">
                              <select
                                value={student.status || "Pending"}
                                onChange={(e) =>
                                  updateApplicationStatus(internship._id, student._id, e.target.value)
                                }
                                className="border rounded px-2 py-1"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>No students have applied for this internship yet.</p>
                )
              ) : (
                <p>Click the button to fetch applications.</p>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-lg text-gray-600">No internships found for this partner.</div>
      )}
    </div>
  );
};

export default InternshipList;
