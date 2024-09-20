import React from "react";

const YourJobPosts = () => {
  // Example aerospace-related job posts based in Canada
  const jobPosts = [
    {
      id: 1,
      title: "Aerospace Engineer",
      company: "AeroTech Canada",
      location: "Montreal, QC",
      status: "Accepted",
      dateApplied: "August 15, 2024",
    },
    {
      id: 2,
      title: "Avionics Technician",
      company: "SkyHigh Innovations",
      location: "Toronto, ON",
      status: "In Review",
      dateApplied: "August 10, 2024",
    },
    {
      id: 3,
      title: "Flight Systems Analyst",
      company: "NorthStar Aerospace",
      location: "Vancouver, BC",
      status: "Interview Scheduled",
      dateApplied: "August 8, 2024",
    },
    {
      id: 4,
      title: "Aircraft Design Engineer",
      company: "AeroDynamics Ltd.",
      location: "Ottawa, ON",
      status: "Rejected",
      dateApplied: "August 1, 2024",
    },
  ];

  return (
    <div className="p-6 font-poppins">
      <h2 className="text-2xl font-semibold mb-4 text-teal-700">
        Your Internship Posts
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobPosts.map((job) => (
          <div
            key={job.id}
            className="bg-white shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-lg font-semibold text-teal-700 mb-2">
              {job.title}
            </h3>
            <p className="text-gray-700">{job.company}</p>
            <p className="text-gray-500">{job.location}</p>
            <p className="text-sm text-gray-400 mt-2">
              Applied on: {job.dateApplied}
            </p>
            <div
              className={`mt-3 px-3 py-1 inline-block rounded-full text-sm font-medium ${
                job.status === "Applied"
                  ? "bg-blue-100 text-blue-800" // Blue for applied
                  : job.status === "In Review"
                  ? "bg-yellow-100 text-yellow-800" // Yellow for review
                  : job.status === "Interview Scheduled"
                  ? "bg-green-100 text-green-800" // Green for interview
                  : "bg-red-100 text-red-800" // Red for rejected
              }`}
            >
              {job.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YourJobPosts;
