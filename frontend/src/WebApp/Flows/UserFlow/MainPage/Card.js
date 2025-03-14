import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaClock, FaDollarSign, FaHeart } from "react-icons/fa";
import axios from "axios";

const JobCard = ({ searchTerm }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get("/api/interns"); // Fetching job data
        setJobs(response.data); // Set jobs to the state
        setLoading(false);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs. Please try again.");
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter job data based on searchTerm and adminApproved
  const filteredJobs = jobs
    .filter((job) => job.adminApproved) // Filter for adminApproved true
    .filter((job) =>
      job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return <p>Loading jobs...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const calculatePostedTime = (date) => {
    const postedDate = new Date(date);
    const currentDate = new Date();
    const differenceInTime = currentDate - postedDate;
    const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));

    if (differenceInDays === 0) return "Today";
    if (differenceInDays === 1) return "Yesterday";
    return `${differenceInDays}d ago`;
  };

  return (
    <div className="flex flex-col md:flex-row flex-wrap gap-4">
      {filteredJobs.length > 0 ? (
        filteredJobs.map((job, index) => (
          <div
            key={index}
            className="w-full max-w-sm p-4 border rounded-lg shadow-md relative"
          >
            {/* Internship Type Badge and Heart Icon on Top Right */}
            <div className="absolute top-2 right-2 flex items-center gap-2">
              
              {job.internshipType === "STIPEND" && (
                <span className="text-xs font-semibold text-green-700 bg-blue-200 px-2 py-1 rounded-full">
                  STIPEND
                </span>
              )}
              {job.internshipType === "FREE" && (
                <span className="text-xs font-semibold text-gray-700 bg-green-200 px-2 py-1 rounded-full">
                  FREE
                </span>
              )}
              {job.internshipType === "PAID" && (
                <span className="text-xs font-semibold text-red-700 bg-red-200 px-2 py-1 rounded-full">
                  PAID
                </span>
              )}
              <button className="text-gray-400 hover:text-red-500">
                <FaHeart />
              </button>
            </div>

            <div className="flex items-start gap-4">
              <img
                src={job.imgUrl}
                alt="Company Logo"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-grow">
                <h5 className="text-lg font-medium">{job.jobTitle}</h5>
                <p className="text-sm text-gray-500">
                  {job.companyName} • {calculatePostedTime(job.createdAt)}
                </p>
              </div>
             
            </div>

            <div className="mt-4">
              <p className="flex items-center text-sm text-gray-500">
                <FaMapMarkerAlt className="mr-2" />
                {job.location}
              </p>
              <p className="flex items-center mt-2 text-sm text-gray-500">
                <FaClock className="mr-2" />
                {new Date(job.startDate).toLocaleDateString()} - {job.endDateOrDuration}
              </p>
              <p className="flex items-center mt-2 text-sm text-gray-500">
                <FaDollarSign className="mr-2" />
                {job.internshipType === "STIPEND"
                  ? `${job.compensationDetails?.amount} ${job.compensationDetails?.currency} per ${job.compensationDetails?.frequency?.toLowerCase()}`
                  : job.internshipType === "FREE"
                    ? "Unpaid / Free"
                    : job.internshipType === "PAID"
                      ? `Student Pays: ${job.compensationDetails?.amount} ${job.compensationDetails?.currency}`
                      : "N/A"
                }
              </p>
            </div>

            <div className="flex gap-2 mt-4 flex-wrap">
              {job.qualifications.map((qualification, index) => (
                <span key={index} className="text-sm bg-gray-200 text-gray-800 py-1 px-3 rounded-full">
                  {qualification}
                </span>
              ))}
            </div>

            <div className="mt-4">
              <a href="#" className="text-purple-600 text-sm font-medium">
                View details
              </a>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No jobs found</p>
      )}
    </div>
  );
};

export default JobCard;
