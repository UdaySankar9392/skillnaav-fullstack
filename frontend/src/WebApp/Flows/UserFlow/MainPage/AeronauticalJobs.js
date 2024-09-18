import React from "react";
import AeroImage from "../../../../assets-webapp/Aero-image.png";
import code from "../../../../assets-webapp/code.png";
import denside from "../../../../assets-webapp/denside.png";
import gradient from "../../../../assets-webapp/gradient.png";
import tech from "../../../../assets-webapp/tech.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faClock,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";

const jobData = [
  {
    jobTitle: "Data Science Intern",
    company: "Harber Inc",
    location: "439 Metz Field, Canada",
    type: "Remote",
    duration: "Internship • 3 months",
    salary: "30k per month",
    field: "Computer science engineering",
    image: tech, // Add image path
  },
  {
    jobTitle: "Software Engineer Intern",
    company: "Acme Corp",
    location: "123 Tech Lane, USA",
    type: "Remote",
    duration: "Internship • 6 months",
    salary: "35k per month",
    field: "Software Engineering",
    image: code, // Add image path
  },
  {
    jobTitle: "Web Developer",
    company: "Techie Ltd",
    location: "789 Code Street, India",
    type: "Remote",
    duration: "Full-time • 12 months",
    salary: "45k per month",
    field: "Web Development",
    image: denside, // Add image path
  },
  {
    jobTitle: "UX/UI Designer",
    company: "Creative Co",
    location: "456 Design Blvd, UK",
    type: "Remote",
    duration: "Full-time • 24 months",
    salary: "50k per month",
    field: "Design",
    image: gradient, // Add image path
  },
];

const JobListing = () => {
  return (
    <div className="font-poppins">
      {/* Header Section */}
      <div className="relative w-full h-64">
        <img
          src={AeroImage}
          alt="Finding Your Dream Job"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Job Recommendations Section */}
      <section className="py-10 px-6">
        <h2 className="text-3xl font-bold mb-2">Find your next role</h2>
        <p className="text-gray-600 mb-6">
          Recommendations based on your profile
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {jobData.map((job, index) => (
            <div key={index} className="border rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <img
                  src={job.image}
                  alt={`${job.company} Logo`}
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
              <div className="flex items-center justify-between">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                  {job.field}
                </span>
                <button className="text-purple-600 hover:underline">
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default JobListing;
