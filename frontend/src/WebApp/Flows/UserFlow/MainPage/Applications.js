import React from "react";
import { useTabContext } from "./UserHomePageContext/HomePageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faMapMarkerAlt,
  faClock,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";

const Applications = () => {
  const { applications } = useTabContext();

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
      {applications.length === 0 ? (
        <p>No applications yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map((job, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <img
                    src="https://via.placeholder.com/60"
                    alt="company-logo"
                    className="rounded-full w-12 h-12 mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{job.jobTitle}</h3>
                    <p className="text-gray-500">{job.company}</p>
                  </div>
                </div>
                <button className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  Applied
                </button>
              </div>
              <div className="text-gray-500 text-sm mb-2">
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
              <div className="flex justify-between items-center">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm bg-gray-200 text-gray-800 py-1 px-3 rounded-full">
                    {job.field}
                  </span>
                  {/* Add more tags if needed */}
                </div>
                <button className="text-purple-500 font-semibold">
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

export default Applications;
