import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaClock, FaDollarSign, FaHeart } from "react-icons/fa";
import axios from "axios";
import AeroImage from "../../../../assets-webapp/Aero-image.png";
import code from "../../../../assets-webapp/code.png";
import denside from "../../../../assets-webapp/denside.png";
import gradient from "../../../../assets-webapp/gradient.png";
import tech from "../../../../assets-webapp/tech.png";

const images = [AeroImage, code, denside, gradient, tech];

const getRandomImage = () => {
  return images[Math.floor(Math.random() * images.length)];
};

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

  return (
    <div className="flex flex-col md:flex-row flex-wrap gap-4">
      {filteredJobs.length > 0 ? (
        filteredJobs.map((job, index) => (
          <div
            key={index}
            className="w-full max-w-sm p-4 border rounded-lg shadow-md"
          >
            <div className="flex items-start gap-4">
              <img
                src={job.imgUrl}
                alt="Company Logo"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-grow">
                <h5 className="text-lg font-medium">{job.jobTitle}</h5>
                <p className="text-sm text-gray-500">{job.companyName}</p>
                <p className="text-xs text-gray-400">5d ago</p>
              </div>
              <button className="text-gray-400 hover:text-black">
                <FaHeart />
              </button>
            </div>
            <div className="mt-4">
              <p className="flex items-center text-sm text-gray-500">
                <FaMapMarkerAlt className="mr-2" />
                {job.location} • {job.jobType}
              </p>
              <p className="flex items-center mt-2 text-sm text-gray-500">
                <FaClock className="mr-2" />
                {job.endDateOrDuration}
              </p>
              <p className="flex items-center mt-2 text-sm text-gray-500">
                <FaDollarSign className="mr-2" />
                {job.stipendOrSalary}
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <span className="px-3 py-1 text-xs text-gray-500 bg-gray-200 rounded-full">
                {job.field}
              </span>
              <span className="px-3 py-1 text-xs text-gray-500 bg-gray-200 rounded-full">
                +2
              </span>
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
