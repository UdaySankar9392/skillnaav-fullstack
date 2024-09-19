import React from "react";

// Extended mock data with 6 internship positions
const mockJobPosts = [
  {
    id: 1,
    title: "Space Research Intern",
    company: "Orbit Labs",
    location: "San Francisco, CA",
    datePosted: "2024-09-15",
    description:
      "Assist in space research projects, perform data analysis, and support senior researchers.",
    type: "Internship",
  },
  {
    id: 2,
    title: "Aerospace Engineering Intern",
    company: "Stellar Innovations",
    location: "Denver, CO",
    datePosted: "2024-09-20",
    description:
      "Support aerospace engineering projects, including design and testing, while gaining hands-on experience.",
    type: "Internship",
  },
  {
    id: 3,
    title: "Astrophysics Intern",
    company: "Galaxy Institute",
    location: "Los Angeles, CA",
    datePosted: "2024-09-22",
    description:
      "Help with astrophysics research, data collection, and analysis, and collaborate with a team of scientists.",
    type: "Internship",
  },
  {
    id: 4,
    title: "Satellite Systems Intern",
    company: "Orbital Dynamics",
    location: "Seattle, WA",
    datePosted: "2024-09-25",
    description:
      "Assist in the development and testing of satellite systems, including software and hardware integration.",
    type: "Internship",
  },
  {
    id: 5,
    title: "Rocket Propulsion Intern",
    company: "Rocket Labs",
    location: "Cape Canaveral, FL",
    datePosted: "2024-09-28",
    description:
      "Work on rocket propulsion systems, including testing and optimization of propulsion technologies.",
    type: "Internship",
  },
  {
    id: 6,
    title: "Space Mission Planning Intern",
    company: "Celestial Ventures",
    location: "Houston, TX",
    datePosted: "2024-09-30",
    description:
      "Assist in planning and coordinating space missions, including logistics, scheduling, and support.",
    type: "Internship",
  },
];

const YourJobPosts = () => {
  return (
    <div className="p-6 font-poppins bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-blue-800">
        Internship Opportunities
      </h2>
      {mockJobPosts.length === 0 ? (
        <p>No internship opportunities available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockJobPosts.map((job) => (
            <div
              key={job.id}
              className="p-6 border border-gray-200 rounded-lg shadow-lg bg-white"
            >
              <h3 className="text-xl font-semibold text-blue-900 mb-2">
                {job.title}
              </h3>
              <p className="text-gray-700 mb-1">
                <strong>{job.company}</strong> - {job.location}
              </p>
              <p className="text-gray-500 text-sm mb-3">
                Posted on: {new Date(job.datePosted).toLocaleDateString()}
              </p>
              <p className="text-gray-600 mb-3">{job.description}</p>
              <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                {job.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YourJobPosts;
