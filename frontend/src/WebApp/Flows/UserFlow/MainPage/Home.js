import React, { useState, useEffect } from "react";
import Homeimage from "../../../../assets-webapp/Home-Image.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faClock,
  faDollarSign,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import ApplyCards from "./ApplyCards";
import { useTabContext } from "./UserHomePageContext/HomePageContext";

const Home = () => {
  const { savedJobs, saveJob, removeJob } = useTabContext();
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobData, setJobData] = useState([]);

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const response = await fetch("/api/interns/");
        const data = await response.json();
        // Filter jobs where isApproved is true
        const approvedJobs = data.filter((job) => job.isApproved);
        setJobData(approvedJobs); // Set the state with approved jobs
      } catch (error) {
        console.error("Error fetching job data:", error);
      }
    };

    fetchJobData();
  }, []); // Empty dependency array to run only on mount

  const handleViewDetails = (job) => {
    setSelectedJob(job);
  };

  const handleBack = () => {
    setSelectedJob(null);
  };

  const toggleSaveJob = (job) => {
    if (savedJobs.some((savedJob) => savedJob.jobTitle === job.jobTitle)) {
      removeJob(job);
    } else {
      saveJob({ ...job, isApplied: false }); // Save the job without applying status
    }
  };

  return (
    <div className="font-poppins">
      {selectedJob ? (
        <ApplyCards job={selectedJob} onBack={handleBack} />
      ) : (
        <>
          {/* Header Section */}
          <div className="relative w-1132px h-250px">
            <img
              src={Homeimage}
              alt="Finding Your Dream Job"
              className="w-full h-full object-cover"
            />
          </div>

          <section className="py-10 px-6">
            <h2 className="text-3xl font-bold mb-2">Find your next role</h2>
            <p className="text-gray-600 mb-6">
              Recommendations based on your profile
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {jobData.map((job, index) => (
                <div
                  key={index}
                  className="relative border rounded-lg p-6 shadow-sm"
                >
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleSaveJob(job)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <FontAwesomeIcon
                        icon={faHeart}
                        className={`w-6 h-6 ${
                          savedJobs.some(
                            (savedJob) => savedJob.jobTitle === job.jobTitle
                          )
                            ? "text-red-500"
                            : "text-gray-500"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center mb-4">
                    <img
                      src={job.imgUrl}
                      alt={`${job.companyName} logo`}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">{job.jobTitle}</h3>
                      <p className="text-gray-600">
                        {job.companyName} • {index + 1}d ago
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-600 mb-4">
                    <p>
                      <FontAwesomeIcon icon={faMapMarkerAlt} /> {job.location} •{" "}
                      {job.jobType}
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faClock} /> {job.startDate} -{" "}
                      {job.endDateOrDuration}
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faDollarSign} />{" "}
                      {job.stipendOrSalary}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                      {job.preferredExperience}
                    </span>
                    <button
                      className="text-purple-600 hover:underline"
                      onClick={() => handleViewDetails(job)}
                    >
                      View details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
