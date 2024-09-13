import React from "react";
import { useTabContext } from "./UserHomePageContext/HomePageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faMapMarkerAlt,
  faClock,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";

const SavedJobs = () => {
  const { savedJobs, removeJob } = useTabContext();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Saved Jobs</h2>
      {savedJobs.length === 0 ? (
        <p className="text-gray-600">You have no saved jobs.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((job, index) => (
            <div
              key={index}
              className="relative border rounded-lg p-6 shadow-sm"
            >
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => removeJob(job)}
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
                  src="/path-to-company-logo.png"
                  alt="Company Logo"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h3 className="text-xl font-semibold">{job.jobTitle}</h3>
                  <p className="text-gray-600">
                    {job.company} • {index + 1}d ago
                  </p>
                </div>
              </div>
              <div className="text-gray-600 mb-4">
                <p>
                  <FontAwesomeIcon icon={faMapMarkerAlt} /> {job.location} •{" "}
                  {job.type}
                </p>
                <p>
                  <FontAwesomeIcon icon={faClock} /> {job.duration}
                </p>
                <p>
                  <FontAwesomeIcon icon={faDollarSign} /> {job.salary}
                </p>
              </div>
              <div className="flex items-center">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                  {job.field}
                </span>
                <button
                  className="text-purple-600 hover:underline"
                  onClick={() => alert("View details coming soon!")}
                >
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
