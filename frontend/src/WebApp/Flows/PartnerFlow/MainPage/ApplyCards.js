import React, { useState } from "react";
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
  const [isApplied, setIsApplied] = useState(
    applications.some((appJob) => appJob.jobTitle === job.jobTitle)
  );

  const handleApply = () => {
    if (!isApplied) {
      setIsApplied(true);
      applyJob(job); // Save the job to applications
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
      <button className="text-gray-500 text-sm mb-4" onClick={onBack}>
        &lt; back
      </button>

      <div className="flex flex-col md:flex-row items-start justify-between mb-4">
        <div className="flex items-start mb-4 md:mb-0">
          <img
            src="https://via.placeholder.com/60"
            alt="company-logo"
            className="rounded-full w-12 h-12 mr-4"
          />
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
              {job.jobTitle}
            </h2>
            <p className="text-gray-500">{job.company}</p>
            <div className="flex items-center text-gray-500 mt-2 text-sm md:text-base">
              <FaMapMarkerAlt className="mr-2" />
              <p>
                {job.location} • {job.type}
              </p>
            </div>
            <div className="flex items-center text-gray-500 mt-2 text-sm md:text-base">
              <FaBriefcase className="mr-2" />
              <p>{job.duration}</p>
            </div>
            <div className="flex items-center text-gray-500 mt-2 text-sm md:text-base">
              <FaDollarSign className="mr-2" />
              <p>{job.salary}</p>
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
          {/* Add the job description here */}
          Accusamus similique repudiandae exercitationem error dolore autem ea
          laborum. Voluptates iste id velit consectetur et a. Rerum ipsum quae.
          Voluptate odit et quo hic rem tempora. Est et consequatur deserunt
          molestias a at quasi dicta. Et sunt maxime at totam ratione.
          <br />
          <br />
          Corrupti pariatur eum eum. Velit cupiditate rerum velit debitis. Sequi
          ducimus ipsum facilis voluptas. Dignissimos dolores aut voluptas.
          Possimus magni voluptas est. Animi impedit aut.
          <br />
          <br />
          Nihil ipsam voluptas. Voluptates omnis et. Dolores modi temporibus
          quidem est porro culpa. Exercitationem qui voluptatem repudiandae
          voluptate et dolores. Est omnis ut et est cumque at provident eos
          sint. Et qui aut recusandae quam dolor explicabo.
        </p>
      </div>

      <div>
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
          Skills required
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="text-sm bg-gray-200 text-gray-800 py-1 px-3 rounded-full">
            {job.field}
          </span>
          {/* Add more skills if needed */}
        </div>
      </div>
    </div>
  );
};

export default ApplyCards;
