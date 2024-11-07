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
    duration: "",
    stipendOrSalary: "",
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
      stipendOrSalary: "",
      qualifications: "",
      duration: "",
      // preferredExperience: "None",
      // applicationDeadline: "",
      // applicationProcess: "",
      contactInfo: {
        name: "",
        email: "",
        phone: "",
      },
      // applicationLinkOrEmail: "",
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
          // location: "Location",
          jobType: "Job Type",
          // stipendOrSalary: "Stipend or Salary",
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
                onChange={(e) => {
                  // Allow spaces and update the state
                  const updatedValue = e.target.value;
                  setFormData((prev) => ({ ...prev, [key]: updatedValue }));
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
                placeholder={`Enter ${label.toLowerCase()}`}
                required
              />

            )}
          </div>
        ))}
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

        {/* Preferred Experience Dropdown
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Preferred Experience
          </label>
          <select
            name="preferredExperience"
            value={formData.preferredExperience}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
          >
            <option value="None">None</option>
            <option value="1-2 years">1-2 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="5+ years">5+ years</option>
          </select>
        </div> */}

        {/* Date Pickers */}
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
          <label className="block text-gray-700 font-medium mb-2">
            End Date or Duration
          </label>
          <input
            type="date"
            name="endDateOrDuration"
            value={formData.endDateOrDuration}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Duration</label>
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            placeholder="Enter duration (e.g., 6 months)"
          />
        </div>

        {/* Contact Info */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Contact Information
          </label>
          {Object.entries(formData.contactInfo).map(([field, value]) => (
            <input
              key={field}
              type={field === "email" ? "email" : "text"}
              name={`contactInfo.${field}`}
              value={value}
              onChange={handleChange}
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
              placeholder={`Enter contact ${field}`}
              required={field === "name" || field === "email"}
            />
          ))}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Image Upload
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
          />
          {uploading && <p className="text-gray-500">Uploading...</p>}
          {previewUrl && (
            <img src={previewUrl} alt="Preview" className="mt-2 rounded" />
          )}
        </div>

        <button
          type="submit"
          className="w-full p-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
        >
          Post Job
        </button>
      </form>
    </div>
  );
};

export default PostAJob;
