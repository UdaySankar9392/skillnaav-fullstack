import React, { useEffect, useState } from "react";
import axios from "axios"; // Import Axios

const UserManagement = () => {
  const [applications, setApplications] = useState([]); // State to store applications
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [error, setError] = useState(null); // State to handle errors

  // Function to fetch applications from the API
  const fetchApplications = async () => {
    try {
      const response = await axios.get("/api/applications"); // Adjust the API endpoint as necessary
      setApplications(response.data); // Update state with the fetched data
    } catch (error) {
      setError(error.message); // Set error message if fetching fails
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  useEffect(() => {
    fetchApplications(); // Call the fetch function on component mount
  }, []); // Empty dependency array means this runs once on mount

  // Render loading state, error message, or applications
  if (loading) return <div>Loading applications...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>User Applications</h2>
      {applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <ul>
          {applications.map((application) => (
            <li
              key={application._id}
              className="border p-2 my-2 rounded shadow"
            >
              <h3 className="font-bold">
                {application.jobTitle} at {application.companyName}
              </h3>
              <p>
                <strong>Location:</strong> {application.location}
              </p>
              <p>
                <strong>Job Type:</strong> {application.jobType}
              </p>
              <p>
                <strong>Contact Name:</strong> {application.contactInfo.name}
              </p>
              <p>
                <strong>Email:</strong> {application.contactInfo.email}
              </p>
              <p>
                <strong>Phone:</strong> {application.contactInfo.phone}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {application.isApplied ? "Applied" : "Not Applied"}
              </p>
              <p>
                <strong>Posted On:</strong>{" "}
                {new Date(application.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserManagement;
