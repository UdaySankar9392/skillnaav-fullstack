import React, { useState } from "react";
import axios from "axios";
import firebase from "firebase/compat/app";
import "firebase/compat/storage"; // Import Firebase storage
import { useTabContext } from "./UserHomePageContext/HomePageContext";


const PostAJob = () => {
  const { saveJob } = useTabContext(); // Get saveJob from context

  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    location: "",
    jobType: "Internship",
    jobDescription: "",
    startDate: "",
    endDateOrDuration: "",
    stipendOrSalary: "",
    qualifications: "",
    preferredExperience: "None",
    applicationDeadline: "",
    applicationProcess: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
    applicationLinkOrEmail: "",
    imgUrl: "",
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
      preferredExperience: "None",
      applicationDeadline: "",
      applicationProcess: "",
      contactInfo: {
        name: "",
        email: "",
        phone: "",
      },
      applicationLinkOrEmail: "",
      imgUrl: "",
    });
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/interns", {
        ...formData,
        imgUrl: formData.imgUrl,
      });
      console.log("Internship posted successfully:", response.data);

      // Save the job in context
      saveJob(response.data);

      resetForm();
    } catch (error) {
      console.error(
        "Error posting internship:",
        error.response?.data || error.message
      );
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
        {/** Input Fields **/}
        {Object.entries({
          jobTitle: "Job Title",
          companyName: "Company Name",
          location: "Location",
          jobType: "Job Type",
          jobDescription: "Job Description",
          startDate: "Start Date",
          endDateOrDuration: "End Date or Duration",
          stipendOrSalary: "Stipend or Salary",
          qualifications: "Qualifications",
          preferredExperience: "Preferred Experience",
          applicationDeadline: "Application Deadline",
          applicationLinkOrEmail: "Application Link or Email",
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
                type={
                  key === "startDate" || key === "applicationDeadline"
                    ? "date"
                    : "text"
                }
                name={key}
                value={formData[key]}
                onChange={
                  key === "qualifications"
                    ? handleQualificationsChange
                    : handleChange
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
                placeholder={`Enter ${label.toLowerCase()}`}
                required
              />
            )}
          </div>
        ))}

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

        {/* Application Process */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Application Process
          </label>
          <textarea
            name="applicationProcess"
            value={formData.applicationProcess}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            placeholder="Describe the application process"
            rows="3"
          />
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
          className="w-full p-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600"
        >
          Post Internship
        </button>
      </form>
    </div>
  );
};

export default PostAJob;
