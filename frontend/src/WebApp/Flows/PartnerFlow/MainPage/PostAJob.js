import React, { useState } from "react";
import axios from "axios";
import firebase from "firebase/compat/app";
import "firebase/compat/storage"; // Import Firebase storage

const PostAJob = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("Internship");
  const [jobDescription, setJobDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDateOrDuration, setEndDateOrDuration] = useState("");
  const [stipendOrSalary, setStipendOrSalary] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [preferredExperience, setPreferredExperience] = useState("None");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [applicationProcess, setApplicationProcess] = useState("");
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [applicationLinkOrEmail, setApplicationLinkOrEmail] = useState("");
  const [imgUrl, setImgUrl] = useState(""); // URL for the uploaded image
  const [uploading, setUploading] = useState(false); // Uploading state
  const [previewUrl, setPreviewUrl] = useState(null); // Preview of selected image

  // Handle job posting submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const postData = {
      jobTitle,
      companyName,
      location,
      jobType,
      jobDescription,
      startDate,
      endDateOrDuration,
      stipendOrSalary,
      qualifications: qualifications.split(",").map((q) => q.trim()), // Convert string to array
      preferredExperience,
      applicationDeadline,
      applicationProcess,
      contactInfo,
      applicationLinkOrEmail,
      imgUrl, // Add the uploaded image URL to postData
    };

    try {
      const response = await axios.post("/api/interns", postData);
      console.log("Internship posted successfully:", response.data);
      resetForm();
    } catch (error) {
      if (error.response) {
        console.error("Error posting internship:", error.response.data);
      } else {
        console.error("Network error:", error.message);
      }
    }
  };

  // Reset the form fields
  const resetForm = () => {
    setJobTitle("");
    setCompanyName("");
    setLocation("");
    setJobType("Internship");
    setJobDescription("");
    setStartDate("");
    setEndDateOrDuration("");
    setStipendOrSalary("");
    setQualifications("");
    setPreferredExperience("None");
    setApplicationDeadline("");
    setApplicationProcess("");
    setContactInfo({
      name: "",
      email: "",
      phone: "",
    });
    setApplicationLinkOrEmail("");
    setImgUrl("");
    setPreviewUrl(null);
  };

  // Handle image upload to Firebase
  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setUploading(true); // Start the uploading state

      // Create a preview of the image for instant feedback
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);

      // Upload to Firebase Storage
      const storageRef = firebase.storage().ref();
      const fileRef = storageRef.child(selectedFile.name);
      fileRef
        .put(selectedFile)
        .then((snapshot) => {
          return snapshot.ref.getDownloadURL();
        })
        .then((downloadURL) => {
          console.log("File available at:", downloadURL);
          setImgUrl(downloadURL); // Set the uploaded image URL
          setUploading(false); // End the uploading state
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
          setUploading(false); // End the uploading state if there's an error
        });
    } else {
      console.log("No file selected.");
    }
  };

  return (
    <div className="max-w-4xl font-poppins mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Post an Internship
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Title */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Job Title
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Enter job title"
            required
          />
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Enter company name"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Enter job location"
            required
          />
        </div>

        {/* Job Type */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Job Type
          </label>
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            required
          >
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Enter job description"
            rows="4"
            required
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            required
          />
        </div>

        {/* End Date or Duration */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            End Date or Duration
          </label>
          <input
            type="text"
            value={endDateOrDuration}
            onChange={(e) => setEndDateOrDuration(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Enter end date or duration"
            required
          />
        </div>

        {/* Stipend or Salary */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Stipend or Salary
          </label>
          <input
            type="text"
            value={stipendOrSalary}
            onChange={(e) => setStipendOrSalary(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Enter stipend or salary details"
            required
          />
        </div>

        {/* Qualifications */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Qualifications
          </label>
          <input
            type="text"
            value={qualifications}
            onChange={(e) => setQualifications(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Enter required qualifications (comma-separated)"
            required
          />
        </div>

        {/* Preferred Experience */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Preferred Experience
          </label>
          <input
            type="text"
            value={preferredExperience}
            onChange={(e) => setPreferredExperience(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Enter preferred experience level (e.g., None)"
          />
        </div>

        {/* Application Deadline */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Application Deadline
          </label>
          <input
            type="date"
            value={applicationDeadline}
            onChange={(e) => setApplicationDeadline(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            required
          />
        </div>

        {/* Application Process */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Application Process
          </label>
          <textarea
            value={applicationProcess}
            onChange={(e) => setApplicationProcess(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Describe the application process"
            rows="3"
          />
        </div>

        {/* Contact Info */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Contact Information
          </label>
          <input
            type="text"
            value={contactInfo.name}
            onChange={(e) =>
              setContactInfo({ ...contactInfo, name: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Enter contact name"
            required
          />
          <input
            type="email"
            value={contactInfo.email}
            onChange={(e) =>
              setContactInfo({ ...contactInfo, email: e.target.value })
            }
            className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Enter contact email"
            required
          />
          <input
            type="tel"
            value={contactInfo.phone}
            onChange={(e) =>
              setContactInfo({ ...contactInfo, phone: e.target.value })
            }
            className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Enter contact phone"
          />
        </div>

        {/* Application Link or Email */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Application Link or Email
          </label>
          <input
            type="text"
            value={applicationLinkOrEmail}
            onChange={(e) => setApplicationLinkOrEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Enter application link or email"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Image Upload
          </label>
          <input type="file" onChange={handleFileUpload} />
          {uploading && <p>Uploading...</p>}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="mt-4 w-full h-64 object-cover"
            />
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-teal-600 text-white font-semibold py-3 rounded-lg hover:bg-teal-700 transition duration-200"
        >
          Post Internship
        </button>
      </form>
    </div>
  );
};

export default PostAJob;
