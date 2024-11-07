import React, { useState } from "react";
import axios from "axios";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { useTabContext } from "./UserHomePageContext/HomePageContext";

const PostAJob = () => {
  const { saveJob } = useTabContext();

  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    city: "",
    country: "",
    jobType: "Internship",
    jobDescription: "",
    startDate: "",
    endDateOrDuration: "",
    duration: "", // Duration (if needed)
    stipendOrSalary: "",
    currency: "", // Default value
    time: "", // Default value
    qualifications: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
    imgUrl: "",
    studentApplied: false,
    adminApproved: false,
  });

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("contactInfo.")) {
      const contactField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        contactInfo: { ...prev.contactInfo, [contactField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleQualificationsChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: e.target.value.split(",").map((q) => q.trim()),
    }));
  };

  const resetForm = () => {
    setFormData({
      jobTitle: "",
      companyName: "",
      location: "",
      jobType: "Internship",
      jobDescription: "",
      startDate: "",
      endDateOrDuration: "",
      salaryDetails: "",
      qualifications: "",
      
      time: "",
      contactInfo: {
        name: "",
        email: "",
        phone: "",
      },
      imgUrl: "",
      studentApplied: false,
      adminApproved: false,
    });
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const completeFormData = {
      ...formData,
      location: `${formData.city}, ${formData.country}`, // Combine city and country
      salaryDetails: `${formData.stipendOrSalary} ${formData.currency} (${formData.time})`, // Combine stipend, currency, and time
      jobDuration: formData.duration || "N/A", // Use "N/A" if duration is not provided
    };

    // Proceed with the post request using completeFormData
    try {
      const response = await axios.post("/api/interns", completeFormData);
      console.log("Internship posted successfully:", response.data);
      saveJob(response.data);
      resetForm();
    } catch (error) {
      console.error("Error posting internship:", error.response?.data || error.message);
    }
  };

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      console.log("No file selected.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(selectedFile);

    try {
      const storageRef = firebase.storage().ref();
      const fileRef = storageRef.child(selectedFile.name);
      const snapshot = await fileRef.put(selectedFile);
      const downloadURL = await snapshot.ref.getDownloadURL();
      setFormData((prev) => ({ ...prev, imgUrl: downloadURL }));
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl font-poppins mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Post an Internship
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Fields */}
        {Object.entries({
          jobTitle: "Job Title",
          companyName: "Company Name",
          qualifications: "Qualifications",
        }).map(([key, label]) => (
          <div key={key}>
            <label className="block text-gray-700 font-medium mb-2">
              {label}
            </label>
            {key === "jobType" ? (
              <select
                name={key}
                value={formData[key]}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
                required
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            ) : (
              <input
                type="text"
                name={key}
                value={formData[key]}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
                placeholder={`Enter ${label.toLowerCase()}`}
                required
              />
            )}
          </div>
        ))}
        
        {/* Salary (Stipend), Currency, and Time Dropdowns */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Stipend/Salary</label>
          <input
            type="text"
            name="stipendOrSalary"
            value={formData.stipendOrSalary}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            placeholder="Enter stipend or salary"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Currency</label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            required
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="INR">INR</option>
            <option value="GBP">GBP</option>
            {/* Add more options as needed */}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Time (Hourly/Monthly)</label>
          <select
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            required
          >
            <option value="Hourly">Per Hour</option>
            <option value="day">per Day</option>
            <option value="Monthly">per Month</option>
            <option value="week">per Week</option>
          </select>
        </div>

        {/* Start Date and End Date */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">End Date</label>
          <input
            type="date"
            name="endDateOrDuration"
            value={formData.endDateOrDuration}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            required
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Duration</label>
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            placeholder="Enter duration (e.g., 6 months)"
            required
          />
        </div>

        {/* City and Country */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            placeholder="Enter city"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Country</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            placeholder="Enter country"
            required
          />
        </div>

                {/* Job Description with Scrollable Textarea */}
                <div>
          <label className="block text-gray-700 font-medium mb-2">Job Description</label>
          <textarea
            name="jobDescription"
            value={formData.jobDescription}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            placeholder="Enter job description"
            style={{
              resize: "vertical", // Allows the user to expand vertically
              maxHeight: "150px", // Limits the max height
              overflowY: "auto", // Enables scroll
              scrollbarWidth: "none", // Hides the scrollbar for Firefox
            }}
            required
          />
        </div>

        {/* Contact Info */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Contact Info</label>
          <input
            type="text"
            name="contactInfo.name"
            value={formData.contactInfo.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            placeholder="Enter name"
            required
          />
          <input
            type="email"
            name="contactInfo.email"
            value={formData.contactInfo.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            placeholder="Enter email"
            required
          />
          <input
            type="tel"
            name="contactInfo.phone"
            value={formData.contactInfo.phone}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            placeholder="Enter phone number"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Upload Logo/Image</label>
          <input
            type="file"
            onChange={handleFileUpload}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-teal-600 text-white p-3 rounded-lg font-medium"
          >
            Post Job
          </button>
          {uploading && <p>Uploading...</p>}
        </div>
      </form>
    </div>
  );
};

export default PostAJob;
