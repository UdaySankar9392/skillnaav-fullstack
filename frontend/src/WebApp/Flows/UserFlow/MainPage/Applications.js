import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faClock,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";

const Applications = () => {
  // State to store applications
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Retrieve studentId from localStorage (via userInfo)
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const studentId = userInfo ? userInfo._id : null;

  // Fetch applications when the component mounts
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        if (!studentId) {
          setError("Student ID not found. Please log in.");
          setLoading(false);
          return;
        }

        // Assuming the API returns applications with internship details
        const response = await axios.get(`/api/applications/student/${studentId}/applications`);
        setApplications(response.data.applications); // Set the applications data
        setLoading(false);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications. Please try again.");
        setLoading(false);
      }
    };

    fetchApplications();
  }, [studentId]); // Fetch based on the logged-in student's ID

  if (loading) {
    return <p>Loading applications...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  // Filter to only include applications where status is "Applied"
  const appliedInternships = applications.filter((application) => application.status === "Applied");

  return (
    <div className="p-4 font-poppins">
      <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
      {appliedInternships.length === 0 ? (
        <p>No applications yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {appliedInternships.map((application, index) => {
            const job = application.internshipId; // Access internship details from internshipId
            return (
              <div key={index} className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <img
                      src={job.imgUrl} // Assuming the job has an image URL
                      alt={`${job.companyName} logo`} // Correct company name
                      className="rounded-full w-12 h-12 mr-4"
                    />
                    <div>
                      <h3 className="text-lg font-semibold">{job.jobTitle}</h3>
                      <p className="text-gray-500">{job.companyName}</p>
                    </div>
                  </div>
                  <button className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    Applied
                  </button>
                </div>
                <div className="text-gray-500 text-sm mb-2">
                  <p>
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> {job.location} •{" "}
                    {job.jobType}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faClock} /> {job.endDateOrDuration}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faDollarSign} /> {job.salaryDetails}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-2">
                    {job.qualifications.map((qualification, idx) => (
                      <span
                        key={idx}
                        className="text-sm bg-gray-200 text-gray-800 py-1 px-3 rounded-full"
                      >
                        {qualification}
                      </span>
                    ))}
                  </div>
                  <button className="text-purple-500 font-semibold">
                    View details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;
