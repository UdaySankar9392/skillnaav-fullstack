import React, { useState } from "react";
import axios from "axios";
import {
  FaHeart,
  FaShareAlt,
  FaMapMarkerAlt,
  FaBriefcase,
  FaDollarSign,
} from "react-icons/fa";
import { useTabContext } from "./UserHomePageContext/HomePageContext";

const ApplyCards = ({ job, onBack }) => {
  const { savedJobs, applications, saveJob, removeJob, applyJob } =
    useTabContext();

  // Check if the job is already applied
  const isAlreadyApplied = applications.some(
    (appJob) => appJob.jobTitle === job.jobTitle
  );
  const [isApplied, setIsApplied] = useState(isAlreadyApplied);

  const handleApply = async () => {
    if (!isApplied) {
      setIsApplied(true); // Temporarily set to avoid multiple clicks

      try {
        const response = await axios.post("/api/applications", {
          jobTitle: job.jobTitle,
          companyName: job.companyName,
          location: job.location,
          jobType: job.jobType,
          startDate: job.startDate,
          endDateOrDuration: job.endDateOrDuration,
          stipendOrSalary: job.stipendOrSalary,
          jobDescription: job.jobDescription,
          qualifications: job.qualifications,
          imgUrl: job.imgUrl,
          contactInfo: {
            name: job.contactInfo?.name,
            email: job.contactInfo?.email,
            phone: job.contactInfo?.phone,
          },
        });

        if (response.status === 201) {
          applyJob(job); // Save the job to the applications context
          alert("Application submitted successfully!");
        } else {
          throw new Error(response.data.message || "Failed to apply.");
        }
      } catch (error) {
        console.error("Error submitting application:", error);
        alert(error.response?.data?.message || "Failed to apply.");
        setIsApplied(false); // Reset state to allow retry
      }
    }
  };

  const toggleSaveJob = () => {
    if (savedJobs.some((savedJob) => savedJob.jobTitle === job.jobTitle)) {
      removeJob(job);
    } else {
      saveJob(job); // Save job to saved jobs
    }
  };

  return (
    <div className="relative bg-white rounded-lg shadow-lg max-w-full mx-auto p-4 sm:p-6 lg:p-8 xl:p-12 overflow-auto">
      <button className="text-gray-500 w-12 h-12 text-sm mb-4" onClick={onBack}>
        &lt; back
      </button>

      <div className="flex flex-col md:flex-row items-start justify-between mb-4">
        <div className="flex items-start mb-4 md:mb-0">
          {job.imgUrl && (
            <img
              src={job.imgUrl}
              alt="company-logo"
              className="rounded-full w-12 h-12 mr-4"
            />
          )}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
              {job.jobTitle}
            </h2>
            <p className="text-gray-500">{job.companyName}</p>
            <div className="flex items-center text-gray-500 mt-2 text-sm md:text-base">
              <FaMapMarkerAlt className="mr-2" />
              <p>
                {job.location} • {job.jobType || "Not specified"}
              </p>
            </div>
            <div className="flex items-center text-gray-500 mt-2 text-sm md:text-base">
              <FaBriefcase className="mr-2" />
              <p>
                From {new Date(job.startDate).toLocaleDateString()} to{" "}
                {job.endDateOrDuration || "Not specified"}
              </p>
            </div>
            <div className="flex items-center text-gray-500 mt-2 text-sm md:text-base">
              <FaDollarSign className="mr-2" />
              <p>{job.stipendOrSalary || "Not specified"}</p>
            </div>
            <button
              onClick={handleApply}
              className={`text-white ${
                isApplied ? "bg-green-500" : "bg-purple-500 hover:bg-purple-600"
              } px-4 py-2 rounded-full font-semibold`}
              disabled={isApplied}
            >
              {isApplied ? "Applied" : "Apply now"}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-4">
          <FaHeart
            className={`text-gray-400 hover:text-red-400 cursor-pointer ${
              savedJobs.some((savedJob) => savedJob.jobTitle === job.jobTitle)
                ? "text-red-500"
                : ""
            }`}
            onClick={toggleSaveJob}
          />
          <FaShareAlt className="text-gray-400 hover:text-blue-400 cursor-pointer" />
        </div>
      </div>

      <hr className="my-4" />

      <div className="mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
          About the job
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {job.jobDescription || "No description available"}
        </p>
      </div>

      <div>
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
          Skills required
        </h3>
        <div className="flex flex-wrap gap-2">
          {(job.qualifications || []).map((qualification, index) => (
            <span
              key={index}
              className="text-sm bg-gray-200 text-gray-800 py-1 px-3 rounded-full"
            >
              {qualification}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
          Contact Information
        </h3>
        <p className="text-gray-600">
          {job.contactInfo?.name || "Not provided"},{" "}
          {job.contactInfo?.email || "Not provided"},{" "}
          {job.contactInfo?.phone || "Not provided"}
        </p>
      </div>
    </div>
  );
};

export default ApplyCards;
