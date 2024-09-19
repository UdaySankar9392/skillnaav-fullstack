import React, { useState } from "react";

const PostAJob = () => {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    datePosted: "",
    description: "",
    type: "Full-time", // Default value
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically handle form submission, e.g., sending data to an API
    console.log("Job posted:", formData);
    // Reset form or show a success message
    setFormData({
      title: "",
      company: "",
      location: "",
      datePosted: "",
      description: "",
      type: "Full-time",
    });
  };

  return (
    <div className="p-6 font-poppins bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-blue-800">Post a Job</h2>
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md"
      >
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-gray-700 font-semibold mb-2"
          >
            Job Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="company"
            className="block text-gray-700 font-semibold mb-2"
          >
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="location"
            className="block text-gray-700 font-semibold mb-2"
          >
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="datePosted"
            className="block text-gray-700 font-semibold mb-2"
          >
            Date Posted
          </label>
          <input
            type="date"
            id="datePosted"
            name="datePosted"
            value={formData.datePosted}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-gray-700 font-semibold mb-2"
          >
            Job Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg"
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label
            htmlFor="type"
            className="block text-gray-700 font-semibold mb-2"
          >
            Job Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Post Job
        </button>
      </form>
    </div>
  );
};

export default PostAJob;
